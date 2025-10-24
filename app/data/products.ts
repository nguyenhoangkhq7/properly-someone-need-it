export interface Product {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image?: string;
}

// Sản phẩm nổi bật (Featured) - Đã cập nhật
export const featuredProducts: Product[] = [
  {
    id: "1",
    title: "iPhone 13 Pro Max 256GB (Cũ 99%)",
    price: "15.000.000 đ",
    originalPrice: "18.000.000 đ",
    discount: "-17%",
    image:
      "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pro-max-graphite-select?wid=940&hei=1112&fmt=png-alpha&.v=1645552346288",
  },
  {
    id: "2",
    title: "Áo khoác bomber Nike (Đã qua sử dụng)",
    price: "450.000 đ",
    originalPrice: "900.000 đ",
    discount: "-50%",
    image:
      "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/a103d794-48f8-41ab-86a3-c1f54d6d63c2/sportswear-essentials-womens-woven-bomber-jacket-N3vSgS.png",
  },
  {
    id: "3",
    title: "Trọn bộ Harry Potter 7 tập (Box set)",
    price: "1.200.000 đ",
    originalPrice: "1.800.000 đ",
    discount: "-33%",
    image:
      "https://m.media-amazon.com/images/I/71rOzy4cyAL._AC_UF1000,1000_QL80_.jpg",
  },
];

// Sản phẩm bán chạy (Trending) - Đã cập nhật
export const trendingProducts: Product[] = [
  {
    id: "4",
    title: "Nồi chiên không dầu Philips (Còn mới 98%)",
    price: "900.000 đ",
    originalPrice: "1.500.000 đ",
    discount: "-40%",
    image:
      "https://images.philips.com/is/image/PhilipsConsumer/HD9252_90-IMS-vi_VN?$jpglarge$&wid=960",
  },
  {
    id: "5",
    title: "Giày Adidas Ultraboost 21 (Size 42)",
    price: "1.200.000 đ",
    image:
      "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/c702e6e3c35b4d619946ad5400d41517_9366/Giay_Ultraboost_Light_trang_HQ6351_01_standard.jpg",
  },
  {
    id: "6",
    title: 'Dell XPS 13" (Core i7, 16GB RAM, 512GB)',
    price: "12.500.000 đ",
    image:
      "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-13-9315/media-gallery/notebook-xps-13-9315-blue-gallery-3.psd?fmt=pjpg&pscan=auto&scl=1&hei=402&wid=573&qlt=100,1&resMode=sharp2&size=573,402&chrss=full",
  },
];
