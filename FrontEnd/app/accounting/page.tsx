"use client"

import type React from "react"
import { useState } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowDownUp, ArrowUpRight, Calendar, DollarSign, Plus, TrendingDown, TrendingUp } from "lucide-react"
// Add MenuProvider to the top imports
import { MenuProvider } from "@/components/providers/menu-provider"
import Advancefeaturemodel from "@/components/AdvancedFeatureModel/advancefeaturemodel"

export default function AccountingPage() {
  // Add at the beginning of the component, before the return statement

     const[openModel,setOpenModel]= useState(false)


      const handleAddPaymentMethod = () => {
    setOpenModel(true)
  }

  const handleCallNow = () => {
    window.open("tel:9027130674", "_self")
  }
  const [activeTab, setActiveTab] = useState("overview")
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: "2025-03-10",
      description: "Daily Sales",
      amount: 1245.5,
      type: "income",
      category: "Sales",
    },
    {
      id: 2,
      date: "2025-03-10",
      description: "Ingredient Purchase",
      amount: 450.75,
      type: "expense",
      category: "Inventory",
    },
    {
      id: 3,
      date: "2025-03-09",
      description: "Staff Wages",
      amount: 850.0,
      type: "expense",
      category: "Payroll",
    },
    {
      id: 4,
      date: "2025-03-09",
      description: "Catering Service",
      amount: 750.0,
      type: "income",
      category: "Services",
    },
    {
      id: 5,
      date: "2025-03-08",
      description: "Utility Bills",
      amount: 320.45,
      type: "expense",
      category: "Utilities",
    },
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: 0,
    type: "income",
    category: "Sales",
  })

  const { toast } = useToast()

  const handleNewTransaction = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: 0,
      type: "income",
      category: "Sales",
    })
    setIsDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: name === "amount" ? parseFloat(value) || 0 : value }))
  }

  const handleSubmit = () => {
    // Validation
    if (!formData.description || formData.amount <= 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a description and a valid amount.",
        variant: "destructive",
      })
      return
    }

    // Create new transaction
    const newId = Math.max(0, ...transactions.map((t) => t.id)) + 1
    setTransactions([
      {
        id: newId,
        date: formData.date,
        description: formData.description,
        amount: Number.parseFloat(formData.amount.toString()),
        type: formData.type,
        category: formData.category,
      },
      ...transactions,
    ])

    toast({
      title: "Transaction added",
      description: `New ${formData.type} transaction has been recorded.`,
    })

    setIsDialogOpen(false)
  }

  // Calculate summary data
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  // Group transactions by category for the chart
  const categories = [...new Set(transactions.map((t) => t.category))]
  const categoryData = categories.map((category) => {
    const amount = transactions
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0)

    return { category, amount }
  })

  return (
      <>
         <Advancefeaturemodel openModel={openModel} setOpenModel={setOpenModel} handleCallNow={handleCallNow}/>

    <MenuProvider>
      <div className="flex flex-col md:flex-row h-screen bg-gray-100">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
          <Header />
          <main className="flex-1 overflow-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">Accounting</h1>
                <p className="text-gray-500">Track restaurant finances and transactions</p>
              </div>
              <Button onClick={handleNewTransaction} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" /> New Transaction
              </Button>
            </div>

            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Total Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="mr-2 rounded-full bg-green-100 p-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">${totalIncome.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Last 30 days</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="mr-2 rounded-full bg-red-100 p-2">
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Last 30 days</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">Net Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div className="mr-2 rounded-full bg-blue-100 p-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">${netProfit.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Last 30 days</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            <div
                              className={`mr-3 rounded-full p-2 ${
                                transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowUpRight className={`h-4 w-4 text-green-600`} />
                              ) : (
                                <ArrowDownUp className={`h-4 w-4 text-red-600`} />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {transaction.date}
                                <span className="mx-1">•</span>
                                {transaction.category}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryData.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.category}</span>
                            <span className={item.amount >= 0 ? "text-green-600" : "text-red-600"}>
                              {item.amount >= 0 ? "+" : ""}
                              {item.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.amount >= 0 ? "bg-green-500" : "bg-red-500"}`}
                              style={{
                                width: `${Math.min(100, (Math.abs(item.amount) / Math.max(...categoryData.map((d) => Math.abs(d.amount)))) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            <div
                              className={`mr-3 rounded-full p-2 ${
                                transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowUpRight className={`h-4 w-4 text-green-600`} />
                              ) : (
                                <ArrowDownUp className={`h-4 w-4 text-red-600`} />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {transaction.date}
                                <span className="mx-1">•</span>
                                {transaction.category}
                              </div>
                            </div>
                          </div>
                          <div
                            className={`font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                          >
                            {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-500">Generate and download financial reports</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                         onClick={handleAddPaymentMethod}
                        variant="outline" className="h-auto py-4 flex flex-col items-center">
                          <DollarSign className="h-8 w-8 mb-2" />
                          <span className="font-medium">Income Statement</span>
                          <span className="text-xs text-gray-500">Monthly profit and loss</span>
                        </Button>

                        <Button 
                         onClick={handleAddPaymentMethod}
                        
                        variant="outline" className="h-auto py-4 flex flex-col items-center">
                          <ArrowDownUp className="h-8 w-8 mb-2" />
                          <span className="font-medium">Cash Flow</span>
                          <span className="text-xs text-gray-500">Money in and out</span>
                        </Button>

                        <Button
                         onClick={handleAddPaymentMethod}
                         
                        variant="outline" className="h-auto py-4 flex flex-col items-center">
                          <TrendingUp className="h-8 w-8 mb-2" />
                          <span className="font-medium">Sales Report</span>
                          <span className="text-xs text-gray-500">Revenue by category</span>
                        </Button>

                        <Button
                         onClick={handleAddPaymentMethod}
                         
                        variant="outline" className="h-auto py-4 flex flex-col items-center">
                          <TrendingDown className="h-8 w-8 mb-2" />
                          <span className="font-medium">Expense Report</span>
                          <span className="text-xs text-gray-500">Costs breakdown</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Transaction Type</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  {formData.type === "income" ? (
                    <>
                      <option value="Sales">Sales</option>
                      <option value="Services">Services</option>
                      <option value="Other Income">Other Income</option>
                    </>
                  ) : (
                    <>
                      <option value="Inventory">Inventory</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Rent">Rent</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Other Expense">Other Expense</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter transaction description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Toaster />
      </div>
    </MenuProvider>
      </>
  )
}

