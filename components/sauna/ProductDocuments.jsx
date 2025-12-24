"use client";

/**
 * ProductDocuments - Video and document/PDF section
 * @param {Object} props
 * @param {Object} props.product - Product data
 */
const ProductDocuments = ({ product }) => {
  const hasVideo = product?.video;
  const hasDocuments =
    (product?.documents && product.documents.length > 0) || product?.pdf;

  if (!hasVideo && !hasDocuments) {
    return null;
  }

  return (
    <div className="space-y-4 mt-8">
      {/* Video Preview */}
      {hasVideo && (
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <video
            src={product.video}
            autoPlay
            muted
            loop
            playsInline
            controls
            poster={
              product?.images && product.images.length > 0
                ? product.images[0]
                : undefined
            }
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Documents */}
      {hasDocuments && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <h3 className="font-semibold mb-3 font-archivo">
            Documentation for {product?.name}
          </h3>
          <ul className="space-y-2">
            {Array.isArray(product?.documents) &&
              product.documents.map((doc, idx) => (
                <li key={`${doc?.url || idx}`} className="font-archivo">
                  <a
                    href={doc?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="text-[#4E7302] hover:underline"
                  >
                    {doc?.label || `Document ${idx + 1}`}
                  </a>
                </li>
              ))}
            {/* Fallback single PDF */}
            {product?.pdf && (
              <li className="font-archivo">
                <a
                  href="/pdf/Toronto Sauna Co - Spec Book.pdf"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4E7302] hover:underline"
                >
                  Download PDF
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductDocuments;
