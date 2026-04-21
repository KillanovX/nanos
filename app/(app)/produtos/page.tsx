'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import ProductForm from '@/components/ProductForm';

export default function ProdutosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (!error) {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-text">Produtos</h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie seu catálogo de produtos e margens de lucro.
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </button>
      </header>

      <section className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-lg border border-border bg-surface px-10 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </div>

        <div className="rounded-lg border border-border bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-hover/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans">Produto</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Custo</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Preço</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Margem</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary font-sans text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                        <span className="text-sm">Carregando produtos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-tertiary">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 opacity-20 mb-2" />
                        <p className="text-sm">Nenhum produto encontrado</p>
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="text-accent text-xs hover:underline">Limpar busca</button>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const margin = product.sale_price > 0 
                      ? ((product.sale_price - product.cost_price) / product.sale_price) * 100 
                      : 0;
                    
                    return (
                      <motion.tr
                        key={product.id}
                        variants={itemVariants}
                        whileHover={{ backgroundColor: 'var(--color-surface-hover)' }}
                        className="group transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-text">{product.name}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-text-secondary font-display">{formatCurrency(product.cost_price)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm text-text font-display font-semibold">{formatCurrency(product.sale_price)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "text-sm font-bold font-display px-2 py-1 rounded-md bg-opacity-10",
                            margin > 20 ? "text-income bg-income/10" : margin > 0 ? "text-accent bg-accent/10" : "text-expense bg-expense/10"
                          )}>
                            {formatPercent(margin)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1.5 rounded-md text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 rounded-md text-text-tertiary hover:text-expense hover:bg-expense/10 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ProductForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
        product={editingProduct}
      />
    </motion.div>
  );
}
