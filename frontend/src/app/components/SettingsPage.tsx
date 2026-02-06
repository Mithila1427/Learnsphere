export function SettingsPage() {
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");

  return (
    <div>
      <h2>Account Information</h2>

      <div>
        <label>Username</label>
        <p>{name}</p>
      </div>

      <div>
        <label>Email</label>
        <p>{email}</p>
      </div>
    </div>
  );
}
