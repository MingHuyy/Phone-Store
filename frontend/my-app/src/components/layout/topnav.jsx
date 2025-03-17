import '../../assets/css/TopNav.css'

const TopNav = () => {
    return (
        <div className="top-nav group">
            <section>
                <ul className="top-nav-quicklink flexContain">
                    <li><a href="index.html"><i className="fa fa-home"></i> Trang chủ</a></li>
                    <li><a href="gioithieu.html"><i className="fa fa-info-circle"></i> Giới thiệu</a></li>
                    <li><a href="trungtambaohanh.html"><i className="fa fa-wrench"></i> Bảo hành</a></li>
                    <li><a href="lienhe.html"><i className="fa fa-phone"></i> Liên hệ</a></li>
                </ul>
            </section>
        </div>
    );
};

export default TopNav;
