const PageHeader = ({ title, description, action }) => {
  return (
    <div className="theme-readable-copy mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="aiq-heading text-3xl font-semibold tracking-normal">{title}</h1>
        <p className="aiq-muted mt-1 max-w-2xl text-sm leading-6">{description}</p>
      </div>
      {action}
    </div>
  );
};

export default PageHeader;
