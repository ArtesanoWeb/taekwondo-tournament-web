import { Suspense } from "react";

import { LoadingNotice } from "@/components/loading-notice";

import { CategoryBracket } from "./category-bracket";

export default function CategoryPage({
  params,
}: PageProps<"/categorias/[id]">) {
  return (
    <div className="flex flex-col gap-6 py-8">
      <Suspense fallback={<LoadingNotice label="Cargando llave…" />}>
        <CategoryBracket params={params} />
      </Suspense>
    </div>
  );
}
