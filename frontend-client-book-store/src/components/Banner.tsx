import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import { fetchVisibleBanners } from "../features/banner/bannerSlice";
import { useAppDispatch, useAppSelector } from "../hooks/hooks";

// Import mini banner images
import miniBanner1 from "../assets/paner_mini/chienthannguvan_310x210_1.jpg";
import miniBanner2 from "../assets/paner_mini/NgoaiVanT10_Resize_310x210_1.jpg";
import miniBanner3 from "../assets/paner_mini/trangphunu_310x210.jpg";
import miniBanner4 from "../assets/paner_mini/Vang_MCBooks_Resize_310x210.jpg";

const miniBannerImages = [
  { img: miniBanner1, alt: "Chiến thần ngữ văn" },
  { img: miniBanner2, alt: "Ngoại văn T10" },
  { img: miniBanner3, alt: "Trang phụ nữ" },
  { img: miniBanner4, alt: "MC Books" },
];

const Banner = () => {
  const dispatch = useAppDispatch();
  const { banners, loading } = useAppSelector((state) => state.banner);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Lấy data từ API khi component mount
  useEffect(() => {
    dispatch(fetchVisibleBanners());
  }, [dispatch]);

  // Tạo mảng bannerImages từ Redux state
  const bannerImages = banners.map((banner) => banner.imageUrl);

  useEffect(() => {
    if (bannerImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const shouldShowHero = loading || bannerImages.length > 0;

  return (
    <>
      {shouldShowHero && (
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background: "#f5f5f5",
          }}
        >
          <div
            className="container"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 16px",
              paddingTop: 20,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "320px",
                borderRadius: "8px",
                overflow: "hidden",
                background: loading ? "#e0e0e0" : "transparent",
              }}
            >
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#999",
                  }}
                >
                  Đang tải banner...
                </div>
              ) : (
                <>
                  {bannerImages.map((image, index) => (
                    <div
                      key={index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: currentBanner === index ? 1 : 0,
                        transition: "opacity 1s ease-in-out",
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                  ))}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 16,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: 8,
                      zIndex: 10,
                    }}
                  >
                    {bannerImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentBanner(index)}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          border: "2px solid white",
                          background:
                            currentBanner === index ? "white" : "transparent",
                          cursor: "pointer",
                          padding: 0,
                          transition: "all 0.3s ease",
                        }}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          background: "#f5f5f5",
          padding: "16px 0",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}
        >
          <Row gutter={[16, 16]}>
            {miniBannerImages.map((banner, index) => (
              <Col key={index} xs={24} sm={12} md={6}>
                <div
                  style={{
                    width: "100%",
                    height: "210px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(201,33,39,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  <img
                    src={banner.img}
                    alt={banner.alt}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </>
  );
};

export default Banner;
