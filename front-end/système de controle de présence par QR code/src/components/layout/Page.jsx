/** Enveloppe de page homogène : largeur, marges et rythme vertical. */
function Page({ children, className = '' }) {
  return (
    <div className={`mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8 ${className}`}>
      {children}
    </div>
  );
}

export default Page;
