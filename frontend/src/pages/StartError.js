function StartError() {
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
      <div
        className="border p-4 rounded shadow bg-body-tertiary bg-opacity-50 w-100 flex justify-content-center align-items-center"
        style={{
          maxWidth: "400px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <h1 className="mb-4 text-center">Server nicht erreichbar</h1>
        <p className="text-muted text-center">
          Ein unbekannter fehler ist aufgetreten. Bitte versuche es später nochmal.
        </p>
      </div>
    </div>
  );
}

export default StartError;
