import { useState } from 'react';
import { ProductCate, ProductCatePayload } from '../types';
import { useProductCates } from '../hooks/useProductCate';
import ProductCateFormModal from '../components/productCate/productCateFormModal';
import ProductCateTable from '../components/productCate/productCateTable';

export default function ProductCateMasterPage() {
    const {
        productCates,
        statuses,
        loading,
        createProductCate,
        updateProductCate,
    } = useProductCates();

    const [selectedProductCate, setSelectedProductCate] = useState<ProductCate | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const openCreateForm = () => {
        setSelectedProductCate(null);
        setIsFormOpen(true);
    };

    const openEditForm = (productCate: ProductCate) => {
        setSelectedProductCate(productCate);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedProductCate(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (payload: ProductCatePayload) => {
        if (selectedProductCate) {
            await updateProductCate(selectedProductCate.id, payload);
    } else {
            await createProductCate(payload);
        }
        closeForm();
    };

    return (
        <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                            Danh mục chủng loại 
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            Quản lý chủng loại. Click vào một dòng để cập nhật.
                        </p>
                    </div>

                    <button
                        onClick={openCreateForm}
                        className="px-4 py-2 bg-blue-700 text-white rounded-lg text-xs font-bold hover:bg-blue-800"
                    >
                        + Thêm mới
                    </button>
                </div>

                <ProductCateTable
                    productCates={productCates}
                    loading={loading}
                    onRowClick={openEditForm}
                />
            </div>

            {isFormOpen && (
                <ProductCateFormModal
                    productCate={selectedProductCate}
                    statuses={statuses}
                    onClose={closeForm}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}