import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import "../assets/css/banner.css"

// Import tất cả ảnh
import banner0 from "../assets/img/banners/banner0.gif"
import banner1 from "../assets/img/banners/banner1.png"
import banner2 from "../assets/img/banners/banner2.png"
import banner3 from "../assets/img/banners/banner3.png"
import banner4 from "../assets/img/banners/banner4.png"
import banner5 from "../assets/img/banners/banner5.png"
import banner6 from "../assets/img/banners/banner6.png"
import banner7 from "../assets/img/banners/banner7.png"
import banner8 from "../assets/img/banners/banner8.png"
import banner9 from "../assets/img/banners/banner9.png"
import bf from "../assets/img/banners/blackFriday.gif"

const banners = [banner0, banner1, banner2, banner3, banner4, banner5, banner6, banner7, banner8, banner9]

const Banner = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 700,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        fade: true,
        cssEase: "cubic-bezier(0.7, 0, 0.3, 1)",
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                },
            },
        ],
    }

    return (
        <div className="banner">
            <Slider {...settings}>
                {banners.map((imgSrc, index) => (
                    <div key={index}>
                        <img src={imgSrc || "/placeholder.svg"} alt={`Banner ${index}`} />
                    </div>
                ))}
            </Slider>
            <div style={{ width: "100%", textAlign: "center", marginTop: "20px" }}>
                <img src={bf || "/placeholder.svg"} alt="Black Friday" style={{ width: "100%", maxWidth: "1200px" }} />
            </div>
        </div>
    )
}

export default Banner

