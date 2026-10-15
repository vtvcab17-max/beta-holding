# Paper Trading của Beta

Đây là mô phỏng lịch sử spot để đánh giá đường ống lấy dữ liệu và cách tính chi phí. **Nó không phải lời khuyên đầu tư, không hứa có lãi và không gửi lệnh Binance thật.** Mẫu hiện tại dùng giao cắt EMA 20/50 trên BTCUSDT; đây chỉ là chiến lược minh họa, chưa được chứng minh có lợi thế.

## Chạy

```bash
npm run paper-trade
```

Lệnh này đọc nến BTCUSDT 1 giờ đã đóng từ endpoint dữ liệu công khai của Binance, mô phỏng 500 nến gần nhất và in P/L, số lệnh, tỷ lệ thắng cùng drawdown tối đa. Các giả định phí và trượt giá nằm trong `src/trading/paper-trader.ts` và cần được thay bằng điều kiện thực tế nếu đánh giá sâu hơn.

## Giới hạn

- Chỉ spot, long-only; mỗi lệnh dùng tối đa 10% số dư mô phỏng.
- Không có futures, margin, đòn bẩy, nạp/rút, API key, endpoint tài khoản hay endpoint đặt lệnh.
- Mô phỏng dùng nến lịch sử và giả định khớp lệnh ở giá mở nến kế tiếp sau tín hiệu; thanh khoản, spread và trượt giá thật có thể khác.
- Một cửa sổ lịch sử ngắn có thể cho kết quả ngẫu nhiên hoặc bị overfit. Cần đánh giá ngoài mẫu, nhiều điều kiện thị trường và phí trước khi quyết định bước tiếp.
- Không được bật giao dịch thật bằng cách thêm API key vào repo. Binance coi API key/secret là thông tin nhạy cảm; nếu sau này có live mode, dùng key riêng, quyền tối thiểu, giới hạn IP và tắt rút tiền. Cần chốt riêng vốn tối đa, mức lỗ ngày, drawdown dừng và quy trình dừng khẩn cấp trước khi viết bộ thực thi live.
