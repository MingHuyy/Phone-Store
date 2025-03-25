import Banner from "../components/banner"
import ProductCase from "../components/product/productcase"

const Home = () => {
    return (
        <div>
            <Banner />
            <ProductCase
                title="Điện thoại mới nhất"
                apiUrl="http://localhost:1111/products"
            />
            <ProductCase
                title="Laptop mới"
                apiUrl="http://localhost:1111/products"
            />
        </div>
    )
}

export default Home