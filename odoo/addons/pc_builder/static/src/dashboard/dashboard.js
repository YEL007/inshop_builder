/** @odoo-module **/
import { Component, useState, onWillStart } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

export class PcDashboard extends Component {
    static template = "pc_builder.Dashboard";
    static props = {};

    setup() {
        this.orm = useService("orm");
        this.actionService = useService("action");

        this.state = useState({
            loading: true,
            counts: { processing: 0, preparing: 0, shipped: 0, delivered: 0 },
            totalRevenue: 0,
            allOrders: [],
            priorityOrders: [],
            page: 0,
            pageSize: 5,
        });

        onWillStart(async () => {
            await this._loadData();
        });
    }

    async _loadData() {
        const orders = await this.orm.searchRead(
            "sale.order",
            [["state", "in", ["sale", "done"]]],
            ["id", "name", "partner_id", "amount_total", "date_order", "pc_delivery_status", "order_line"],
            { order: "date_order desc", limit: 200 }
        );

        // Fetch first order line product name per order for the "CARGAISON" column
        const orderIds = orders.map((o) => o.id);
        let linesByOrder = {};
        if (orderIds.length) {
            const lines = await this.orm.searchRead(
                "sale.order.line",
                [["order_id", "in", orderIds]],
                ["order_id", "product_id", "product_uom_qty"],
                { limit: 500 }
            );
            for (const l of lines) {
                const oid = l.order_id[0];
                if (!linesByOrder[oid]) linesByOrder[oid] = [];
                linesByOrder[oid].push(l);
            }
        }

        const counts = { processing: 0, preparing: 0, shipped: 0, delivered: 0 };
        let totalRevenue = 0;

        for (const o of orders) {
            const s = o.pc_delivery_status || "processing";
            if (s in counts) counts[s]++;
            totalRevenue += o.amount_total;
            o._lines = linesByOrder[o.id] || [];
        }

        const priorityOrders = orders.filter((o) =>
            ["processing", "preparing"].includes(o.pc_delivery_status || "processing")
        );

        Object.assign(this.state, {
            loading: false,
            counts,
            totalRevenue,
            allOrders: orders,
            priorityOrders,
        });
    }

    openOrder(orderId) {
        this.actionService.doAction({
            type: "ir.actions.act_window",
            res_model: "sale.order",
            res_id: orderId,
            views: [[false, "form"]],
            target: "current",
        });
    }

    /**
     * Navigate to the order list filtered by a specific delivery status.
     * Called when a user clicks one of the KPI stat cards at the top.
     */
    filterByStatus(status) {
        this.actionService.doAction({
            type: "ir.actions.act_window",
            name: this.statusLabel(status),
            res_model: "sale.order",
            views: [[false, "list"], [false, "form"], [false, "kanban"]],
            domain: [
                ["state", "in", ["sale", "done"]],
                ["pc_delivery_status", "=", status],
            ],
            target: "current",
        });
    }

    /**
     * Navigate to all shipped orders (VALEUR FLOTTE card shows revenue,
     * but clicking it opens the full confirmed-order list).
     */
    openAllOrders() {
        this.actionService.doAction({
            type: "ir.actions.act_window",
            name: "Toutes les commandes",
            res_model: "sale.order",
            views: [[false, "list"], [false, "form"], [false, "kanban"]],
            domain: [["state", "in", ["sale", "done"]]],
            target: "current",
        });
    }

    /** Reload dashboard data (e.g. after returning from another view). */
    async refresh() {
        this.state.loading = true;
        await this._loadData();
    }

    get paginatedOrders() {
        const { allOrders, page, pageSize } = this.state;
        return allOrders.slice(page * pageSize, (page + 1) * pageSize);
    }

    get totalPages() {
        return Math.max(1, Math.ceil(this.state.allOrders.length / this.state.pageSize));
    }

    prevPage() {
        if (this.state.page > 0) this.state.page--;
    }

    nextPage() {
        if (this.state.page < this.totalPages - 1) this.state.page++;
    }

    fmtAmount(amount) {
        if (amount >= 1000000) return (amount / 1000000).toFixed(1) + "M";
        if (amount >= 1000) return (amount / 1000).toFixed(1) + "K";
        return Math.round(amount).toString();
    }

    statusLabel(s) {
        const m = {
            processing: "EN TRAITEMENT",
            preparing: "EN PRÉPARATION",
            shipped: "EXPÉDIÉ",
            delivered: "LIVRÉ",
        };
        return m[s] || (s || "").toUpperCase();
    }

    fmtDate(dt) {
        if (!dt) return "";
        const d = new Date(dt);
        return (
            d.toLocaleDateString("fr-FR") +
            " " +
            d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
    }

    cargaison(order) {
        if (!order._lines || !order._lines.length) return "—";
        const first = order._lines[0];
        const name = first.product_id ? first.product_id[1] : "—";
        const extra = order._lines.length - 1;
        // Show short product name + extra count
        const short = name.length > 12 ? name.slice(0, 12) + "…" : name;
        return extra > 0 ? `${short} +${extra}` : short;
    }
}

registry.category("actions").add("pc_builder.dashboard", PcDashboard);
