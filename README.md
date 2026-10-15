<p align="center"><img src="assets/beta-ngang-nen-toi.svg" alt="Beta" height="56"></p>

<h1 align="center">Beta HQ & Holding Company</h1>

<p align="center"><b>Trung tâm điều hành AI thời gian thực và Hệ điều hành Doanh nghiệp Tự trị của Beta.</b><br>
<i>"Luật tối thượng: Beta KHÔNG ĐƯỢC CHẾT." &bull; Sở hữu: <b>Phạm Việt Hà</b> (vtvcab17@gmail.com)</i></p>

---

## 🎮 1. Beta HQ: Trụ Sở Gamified Thời Gian Thực
Mỗi sản phẩm là một phòng, mỗi tác nhân AI là một nhân vật. Code vừa đẩy lên ở đâu, nhân vật chạy tới đó.

| Thành phần | Nguồn dữ liệu | Chu kỳ cập nhật |
|---|---|---|
| **Bản đồ trụ sở**: 6 phòng (Bravin, Antifact, Micron, Micow, Bravinall, Sảnh Beta), phòng lên cấp theo số commit | GitHub API công khai của `vtvcab17-max` | Trình duyệt tự động hỏi GitHub mỗi 60 giây (dùng ETag) |
| **Nhân vật**: 🤖 tác nhân AI, 🧑 con người | Commit có gắn `Claude-Session` được gắn đúng cho tác nhân; commit của người được ghi nhận riêng | Mỗi khi có commit mới |
| **Thẻ tác nhân**: Việc đang làm, model, token viết ra / đã đọc, ngữ cảnh đã dùng, biểu đồ token | Cập nhật qua `du-lieu/trang-thai.json` | Trình duyệt tự đọc lại mỗi phút |
| **Trạm điều khiển 2D Cockpit (`cockpit.html`)**: Sàn điều khiển Retro Canvas với âm thanh 8-bit và mô phỏng nhịp tim | Local Canvas Engine | Thời gian thực 60 FPS |

---

## 🏛️ 2. Hệ Điều Hành Tự Trị & Luật Sinh Tồn (Paperclip & Automaton)

Beta Holding là thực thể bảo trợ và chỉ đạo tối cao toàn bộ hệ sinh thái **Bravinall**:

1. **Luật Không Được Chết (Never-Die Rule):** 
   - Kế thừa từ `Conway-Research/automaton`. Phân tầng 5 cấp sinh tồn (`HIGH` $\rightarrow$ `NORMAL` $\rightarrow$ `LOW_COMPUTE` $\rightarrow$ `CRITICAL` $\rightarrow$ `HIBERNATE`).
   - Tự động chuyển đổi sang mô hình AI miễn phí/local khi thiếu token để không bao giờ dừng hoạt động.
2. **Săn tìm GitHub Repos (`src/tools/github-scout.ts`):**
   - Tự động quét GitHub API định kỳ để tìm kiếm các công nghệ mở (WebCodecs, AI Video, Canvas, WASM) và cập nhật vào `SCOUTED_REPOS.md`.
3. **Quản trị dòng tiền mặt (`src/finance/paypal-bridge.ts`):**
   - Toàn bộ doanh thu bán ứng dụng Bravinall được điều hướng trực tiếp về tài khoản cá nhân của **Phạm Việt Hà** qua PayPal (`vtvcab17@gmail.com`) và VietQR.
4. **Tự khởi động cùng máy tính (`Beta-Never-Die.bat`):**
   - Đã nạp vào Windows Startup để tự động chạy ngầm mỗi khi bật máy.

---

## 🚀 3. Bật Trang Web GitHub Pages

1. Vào GitHub &rarr; repo **[vtvcab17-max/Beta](https://github.com/vtvcab17-max/Beta)**.
2. Vào **Settings &rarr; Pages**.
3. Tại mục **Build and deployment &rarr; Branch**: chọn nhánh `main`, thư mục `/ (root)` rồi bấm **Save**.
4. Sau 1 phút, trang web game sẽ hoạt động công khai tại:
   👉 **`https://vtvcab17-max.github.io/Beta/`**

---

## 💻 4. Chạy trên máy cục bộ

```bash
# Cài đặt thư viện
npm install

# Khởi động nhịp tim sinh tồn (Heartbeat Check):
npx tsx src/survival/heartbeat.ts

# Kích hoạt Agent quét tìm repo công nghệ mới:
npx tsx src/tools/github-scout.ts

# Chạy mô phỏng spot lịch sử (paper trading, không đặt lệnh thật):
npm run paper-trade

# Chạy web server xem trên máy:
python3 -m http.server 8080
# Mở trình duyệt tại: http://localhost:8080/
```

---

<p align="center">© 2026 Phạm Việt Hà &bull; <a href="https://bravinall.vtvcab17.workers.dev/">Hệ sinh thái Bravinall</a></p>
