import { Link } from "react-router-dom";


const Logo = () => {
    return(
        <>
            <div className="logo">
                <h1 className="header__logo">
                    <Link to="/"> Fashion Forward </Link>
                </h1>
            </div>
        </>
        
    );
}

export default Logo;
