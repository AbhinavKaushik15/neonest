"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { Plus, Package, AlertTriangle, Edit, Trash2, Bell, Save, ShoppingCart } from "lucide-react";

const itemCategories = [
  { id: "diapers", name: "Diapers & Wipes", icon: "🍼" },
  { id: "feeding", name: "Feeding Supplies", icon: "🍼" },
  { id: "clothing", name: "Clothing", icon: "👕" },
  { id: "health", name: "Health & Safety", icon: "🏥" },
  { id: "toys", name: "Toys & Books", icon: "🧸" },
  { id: "other", name: "Other", icon: "📦" },
];

export default function Page() {
  const [inventory, setInventory] = useState([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "diapers",
    currentStock: "",
    minThreshold: "",
    unit: "pieces",
    notes: "",
  });

  useEffect(() => {
    const savedInventory = localStorage.getItem("babyInventory");
    if (savedInventory) setInventory(JSON.parse(savedInventory));
  }, []);

  useEffect(() => {
    localStorage.setItem("babyInventory", JSON.stringify(inventory));
  }, [inventory]);

  const addItem = () => {
    if (newItem.name && newItem.currentStock && newItem.minThreshold) {
      const item = {
        id: Date.now(),
        ...newItem,
        currentStock: parseInt(newItem.currentStock),
        minThreshold: parseInt(newItem.minThreshold),
        lastUpdated: new Date().toISOString(),
      };
      setInventory([...inventory, item]);
      setNewItem({ name: "", category: "diapers", currentStock: "", minThreshold: "", unit: "pieces", notes: "" });
      setIsAddingItem(false);
    }
  };

  const updateItem = (id, updatedItem) => {
    setInventory(
      inventory.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updatedItem,
              currentStock: parseInt(updatedItem.currentStock),
              minThreshold: parseInt(updatedItem.minThreshold),
              lastUpdated: new Date().toISOString(),
            }
          : item
      )
    );
    setEditingItem(null);
  };

  const deleteItem = (id) => {
    setInventory(inventory.filter((item) => item.id !== id));
  };

  const updateStock = (id, newStock) => {
    setInventory(
      inventory.map((item) =>
        item.id === id
          ? {
              ...item,
              currentStock: parseInt(newStock),
              lastUpdated: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const lowStockItems = inventory.filter((item) => item.currentStock <= item.minThreshold);
  const outOfStockItems = inventory.filter((item) => item.currentStock === 0);

  const getStockStatus = (item) => {
    if (item.currentStock === 0) return { status: "out", color: "bg-red-100 text-red-700", text: "Out of Stock" };
    if (item.currentStock <= item.minThreshold)
      return { status: "low", color: "bg-yellow-500 text-yellow-700", text: "Low Stock" };
    return { status: "good", color: "bg-green-500 text-green-700", text: "In Stock" };
  };

  const getCategoryIcon = (categoryId) => {
    const category = itemCategories.find((cat) => cat.id === categoryId);
    return category ? category.icon : "📦";
  };

  return (
    <div className="space-y-8 px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-1">Baby Essentials Tracker</h2>
          <p className="text-gray-600 text-sm">Keep track of diapers, formula, and other baby essentials</p>
        </div>
        <Button
          onClick={() => setIsAddingItem(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <div className="space-y-3">
          {outOfStockItems.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Out of Stock ({outOfStockItems.length} items)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {outOfStockItems.map((item) => (
                    <Badge key={item.id} variant="destructive">
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockItems.length > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Low Stock Alert ({lowStockItems.length} items)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map((item) => (
                    <Badge key={item.id} className="bg-yellow-100 text-yellow-700">
                      {item.name} ({item.currentStock} left)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add/Edit Item */}
      {(isAddingItem || editingItem) && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              {editingItem ? "Edit Item" : "Add New Item"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Item Name</label>
                <Input
                  placeholder="e.g., Newborn Diapers"
                  value={editingItem ? editingItem.name : newItem.name}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, name: e.target.value })
                    } else {
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editingItem ? editingItem.category : newItem.category}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, category: e.target.value })
                    } else {
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                  }}
                >
                  {itemCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Current Stock</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={editingItem ? editingItem.currentStock : newItem.currentStock}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, currentStock: e.target.value })
                    } else {
                      setNewItem({ ...newItem, currentStock: e.target.value })
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Low Stock Alert (minimum)</label>
                <Input
                  type="number"
                  placeholder="5"
                  value={editingItem ? editingItem.minThreshold : newItem.minThreshold}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, minThreshold: e.target.value })
                    } else {
                      setNewItem({ ...newItem, minThreshold: e.target.value })
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unit</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={editingItem ? editingItem.unit : newItem.unit}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, unit: e.target.value })
                    } else {
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                  }}
                >
                  <option value="pieces">Pieces</option>
                  <option value="bottles">Bottles</option>
                  <option value="packs">Packs</option>
                  <option value="boxes">Boxes</option>
                  <option value="oz">Ounces</option>
                  <option value="lbs">Pounds</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Input
                  placeholder="Optional notes"
                  value={editingItem ? editingItem.notes : newItem.notes}
                  onChange={(e) => {
                    if (editingItem) {
                      setEditingItem({ ...editingItem, notes: e.target.value })
                    } else {
                      setNewItem({ ...newItem, notes: e.target.value })
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingItem ? () => updateItem(editingItem.id, editingItem) : addItem}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingItem ? "Update" : "Add"} Item
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingItem(false)
                  setEditingItem(null)
                  setNewItem({
                    name: "",
                    category: "diapers",
                    currentStock: "",
                    minThreshold: "",
                    unit: "pieces",
                    notes: "",
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Essentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => {
          const stockStatus = getStockStatus(item)
          return (
            <Card key={item.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {itemCategories.find((cat) => cat.id === item.category)?.name}
                      </p>
                    </div>
                  </div>
                  <Badge className={stockStatus.color}>{stockStatus.text}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Stock:</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={item.currentStock}
                      onChange={(e) => updateStock(item.id, e.target.value)}
                      className="w-20 h-8 text-center"
                    />
                    <span className="text-sm text-gray-500">{item.unit}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Alert when below:</span>
                  <span className="font-medium">
                    {item.minThreshold} {item.unit}
                  </span>
                </div>

                {item.notes && <p className="text-sm text-gray-500 italic">"{item.notes}"</p>}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingItem(item)} className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {inventory.length === 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No items in inventory</h3>
            <p className="text-gray-500 mb-4">Start tracking your baby essentials to get low stock alerts</p>
            <Button
              onClick={() => setIsAddingItem(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Item
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shopping List */}
      {lowStockItems.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-orange-600" />
              Shopping List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white/50 rounded">
                  <span>{item.name}</span>
                  <Badge variant="outline">
                    Need: {Math.max(item.minThreshold * 2 - item.currentStock, item.minThreshold)} {item.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}