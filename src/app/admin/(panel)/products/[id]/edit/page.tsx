import { notFound } from "next/navigation";
import { updateProductAction } from "@/app/admin/(panel)/products/actions";
import {
  getProductFormCategories,
  getProductFormValues,
} from "@/app/admin/(panel)/products/form-data";
import { ProductFormPage } from "@/app/admin/(panel)/products/product-form";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "Edit Product",
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    getProductFormCategories(),
    getProductFormValues(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductFormPage
      action={updateProductAction}
      categories={categories}
      mode="edit"
      product={product}
    />
  );
}
