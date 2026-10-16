"use client";

import { ErrorNotice } from "@/components/error-notice";

export default function Error({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className="py-8">
      <ErrorNotice
        message="Algo salió mal al cargar esta página."
        onRetry={retry}
      />
    </div>
  );
}
