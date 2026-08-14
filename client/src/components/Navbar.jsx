function Navbar() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    return (
        <header className="navbar">

            <div>
                <h2>Dashboard</h2>
            </div>

            <div className="user-info">

                <div className="avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>

                <span>
                    {user?.name}
                </span>

            </div>

        </header>
    );
}

export default Navbar;