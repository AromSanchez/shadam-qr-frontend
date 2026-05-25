"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Search, Package, Edit, CheckCircle2, XCircle } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  available: boolean;
  image: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    available: true,
    image: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      const [prodData, catData] = await Promise.all([
        prodRes.json(),
        catRes.json()
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Complete los campos obligatorios");
      return;
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Producto agregado");
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          available: true,
          image: ""
        });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al crear");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast.success("Producto eliminado");
        fetchData();
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !product.available })
      });

      if (res.ok) {
        toast.success("Estado actualizado");
        fetchData();
      }
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <Toaster richColors position="top-right" />
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-0.5">
              <Package className="text-[#06b6d4]" size={22} />
              <h1 className="text-2xl font-bold text-foreground">Gestión de Productos</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-8">Administra el catálogo de platos y bebidas</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#06b6d4] hover:bg-[#c05520] text-white">
                <Plus size={16} /> Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-[#06b6d4]">Agregar Producto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Nombre del Plato/Bebida</Label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ej. Ceviche de Pescado"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Precio (S/)</Label>
                    <Input 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Categoría</Label>
                    <select 
                      className="w-full bg-card border border-border rounded-lg p-2 text-sm"
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                    >
                      <option value="">Seleccionar...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Descripción</Label>
                  <textarea 
                    className="w-full bg-card border border-border rounded-lg p-2 text-sm min-h-[80px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Breve descripción del producto..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>URL de Imagen (Opcional)</Label>
                  <Input 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})} 
                    placeholder="https://..."
                  />
                </div>
                <Button type="submit" className="w-full bg-[#06b6d4] hover:bg-[#c05520] text-white mt-2">
                  Guardar Producto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Buscar por nombre o descripción..." 
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ══════════════════════════════════════
            MOBILE: lista de cards (oculto en md+)
        ══════════════════════════════════════ */}
        <div className="flex flex-col gap-3 md:hidden">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Cargando productos...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay productos registrados</p>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <div className="px-4 pt-4 pb-3 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center flex-shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {categories.find(c => c.id === p.categoryId)?.name || "Sin categoría"}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-base text-foreground">
                      S/ {p.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1 border-t border-border mt-2">
                    <span className="text-xs text-muted-foreground line-clamp-1 flex-1 pr-2">{p.description}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.available 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}>
                      {p.available ? "Disponible" : "Agotado"}
                    </span>
                  </div>
                </div>

                {/* actions */}
                <div className="flex border-t border-border">
                  <button
                    onClick={() => toggleAvailability(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/50 transition-colors border-r border-border"
                  >
                    {p.available ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                    {p.available ? "Agotar" : "Activar"}
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} /> Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ══════════════════════════════════════
            DESKTOP: tabla (oculto en mobile)
        ══════════════════════════════════════ */}
        <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 bg-muted/40 border-b border-border">
            <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
              Listado de productos
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5 w-[80px]">Imagen</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Producto</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Categoría</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Precio</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Estado</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right pr-5">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Cargando productos...</TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No hay productos registrados</TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((p) => (
                  <TableRow key={p.id} className="border-border hover:bg-muted/40 transition-colors">
                    <TableCell className="pl-5">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden border border-border flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={20} className="text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-bold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {categories.find(c => c.id === p.categoryId)?.name || "Sin categoría"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      S/ {p.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <button 
                        onClick={() => toggleAvailability(p)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${
                          p.available 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
                            : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
                        }`}
                      >
                        {p.available ? (
                          <><CheckCircle2 size={12} /> Disponible</>
                        ) : (
                          <><XCircle size={12} /> Agotado</>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-blue-600">
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
