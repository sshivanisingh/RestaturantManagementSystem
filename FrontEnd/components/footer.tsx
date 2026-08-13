"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function Footer() {
  const [orders, setOrders] = useState([
    { id: "T1", table: "T1", items: 6, kitchen: "Kitchen", status: "Process" },
    { id: "T2", table: "T2", items: 4, kitchen: "Kitchen", status: "" },
    { id: "T3", table: "T3", items: 3, kitchen: "Kitchen", status: "" },
  ])

  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  const handleStatusChange = (status: string) => {
    if (!selectedOrder) return

    setOrders(orders.map((order) => (order.id === selectedOrder.id ? { ...order, status } : order)))

    setIsDialogOpen(false)
  }

  return (
    <>
      <div className="bg-white border-t p-4 flex flex-col sm:flex-row gap-4 overflow-x-auto">
        {orders.map((order, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-orange-50 rounded-lg p-3 flex-1 cursor-pointer hover:bg-orange-100 transition-colors"
            onClick={() => handleOrderClick(order)}
          >
            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-medium">
              {order.table}
            </div>
            <div>
              <div className="text-sm font-medium">
                {order.items} Items → {order.kitchen}
              </div>
              {order.status && <div className="text-xs text-orange-600">{order.status}</div>}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details - Table {selectedOrder?.table}</DialogTitle>
            <DialogDescription>Manage the order status and details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Order Information</h3>
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{selectedOrder?.items}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kitchen:</span>
                  <span>{selectedOrder?.kitchen}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-orange-600 font-medium">{selectedOrder?.status || "Pending"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Update Status</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={() => handleStatusChange("Process")}>
                  Process
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleStatusChange("Ready")}>
                  Ready
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleStatusChange("Served")}>
                  Served
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleStatusChange("Completed")}>
                  Completed
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

