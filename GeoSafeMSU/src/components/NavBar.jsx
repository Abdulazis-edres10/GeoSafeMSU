import { Link } from "react-router-dom"
import shield from '../assets/shield.png';


function NavBar(){
    return <nav className="navBar">
        <div className="navBar-brand">
            <img src={shield} alt="shield" className="shield-logo" /> 
            {/* <Link to = "/DashboardPage">Dashboard</Link> */}
        </div>
        <div className="navBar-links">
            <Link to="/Dashboard" className="nav-link">Dashboard</Link>
            <Link to="/Analytics" className="nav-link">Analytics</Link>
            <Link to="/" className="nav-link">User Management</Link>
            <Link to="/" className="nav-link">Report</Link>
            <Link to="/" className="nav-link">Settings</Link>
        </div>
    </nav>
}

export default NavBar;