function StartLoading() {
  return (
    <div
      className="vh-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: "url('/assets/images/default_bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-center">
        <span
          className="spinner-border spinner-border-xl text-primary"
          role="status"
          aria-hidden="true"
        />
        <h1 className="mb-4 ">Loading...</h1>
      </div>
    </div>
  );
}

export default StartLoading;
