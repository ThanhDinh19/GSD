import { useState } from 'react';
import { ProductCateGroup, ProductCateGroupPayload } from '../types';
import { useProductCateGroups } from '../hooks/useProductCateGroup';
import ProductCateGroupFormModal from '../components/productCateGroup/productCateGroupFormModal';
import ProductCateGroupTable from '../components/productCateGroup/productCateGroupTable';

export default function ProductCateMasterPage() {
    const {
        productCateGroups,
        statuses,
        loading,
        createProductCateGroup,
        updateProductCateGroup,
    } = useProductCateGroups();

    const [selectedProductCateGroup, setSelectedProductCateGroup] = useState<ProductCateGroup | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const openCreateForm = () => {
        setSelectedProductCateGroup(null);
        setIsFormOpen(true);
    };

    const openEditForm = (productCate: ProductCateGroup) => {
        setSelectedProductCateGroup(productCate);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setSelectedProductCateGroup(null);
        setIsFormOpen(false);
    };

    const handleSubmit = async (payload: ProductCateGroupPayload) => {
        if (selectedProductCateGroup) {
            await updateProductCateGroup(selectedProductCateGroup.id, payload);
    } else {
            await createProductCateGroup(payload);
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

                <ProductCateGroupTable
                    productCateGroups={productCateGroups}
                    loading={loading}
                    onRowClick={openEditForm}
                />
            </div>

            {isFormOpen && (
                <ProductCateGroupFormModal
                    productCateGroup={selectedProductCateGroup}
                    statuses={statuses}
                    onClose={closeForm}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}