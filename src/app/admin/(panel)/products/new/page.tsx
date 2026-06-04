import { createProductAction } from "@/app/admin/(panel)/products/actions";
import {
  getBlankProductFormValues,
  getProductFormCategories,
} from "@/app/admin/(panel)/products/form-data";
import { ProductFormPage } from "@/app/admin/(panel)/products/product-form";

export const metadata = {
  title: "Create Product",
};

export default async function NewProductPage() {
  const categories = await getProductFormCategories();

  return (
    <ProductFormPage
      action={createProductAction}
      categories={categories}
      mode="create"
      product={getBlankProductFormValues()}
    />
  );
}
