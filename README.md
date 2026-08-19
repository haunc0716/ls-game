# Dấu Ấn Lịch Sử 1939–1945

Trò chơi ghép cặp sự kiện và ý nghĩa lịch sử về phong trào giải phóng dân tộc Việt Nam giai đoạn 1939–1945.

## Chạy dự án

```bash
npm install
npm run dev
```

Kiểm tra chất lượng và tạo bản production:

```bash
npm run lint
npm run build
```

## Cấu trúc chính

- `src/data/pairs.js`: 8 cặp sự kiện và ý nghĩa lịch sử.
- `src/hooks/useGameLogic.js`: trạng thái trò chơi, tính điểm, đồng hồ và bảng xếp hạng.
- `src/components/`: các màn hình và thành phần giao diện.
- `public/assets/coffee-game/history-*.png`: bộ nền lịch sử 1939–1945.
- `google-apps-script/Code.gs`: backend Google Sheets cho bảng xếp hạng.

## Google Sheets leaderboard — tạo mới từ đầu (từng bước)

Làm theo đúng thứ tự, chỉ mất khoảng 5 phút:

1. **Tạo Google Sheet mới**: vào [sheets.google.com](https://sheets.google.com) → "Trống" (Blank) để tạo 1 spreadsheet mới. Đặt tên tùy ý (vd: "Bảng xếp hạng VNR202"). Không cần tự tạo sheet con hay cột tiêu đề — script sẽ tự tạo sheet `LichSu1939_1945` và điền tiêu đề khi có người chơi đầu tiên nộp điểm.

2. **Mở Apps Script**: trong Google Sheet vừa tạo, vào menu **Tiện ích mở rộng (Extensions) → Apps Script**. Một tab mới hiện ra với file mặc định `Code.gs` đang trống hoặc có sẵn `function myFunction() {}`.

3. **Dán code**: xóa hết nội dung mặc định trong `Code.gs` trên trình soạn Apps Script, rồi copy toàn bộ nội dung từ file `google-apps-script/Code.gs` trong project này vào, sau đó lưu (Ctrl+S / Cmd+S).

4. **Deploy thành Web App**:
   - Bấm nút **Deploy (Triển khai)** ở góc trên bên phải → **New deployment (Triển khai mới)**.
   - Ở mục "Select type", bấm biểu tượng bánh răng ⚙️ → chọn **Web app**.
   - Trong phần cấu hình: **Execute as** chọn "Me" (tài khoản của bạn); **Who has access** chọn **"Anyone"** (bắt buộc, vì đây là bảng xếp hạng public cho người chơi ẩn danh, không đăng nhập).
   - Bấm **Deploy**. Lần đầu Google sẽ yêu cầu **Authorize access** — chọn tài khoản Google của bạn, bấm "Advanced" → "Go to (tên project) (unsafe)" → "Allow". (Cảnh báo "unsafe" là bình thường vì đây là script tự viết, chưa qua kiểm duyệt của Google — không phải lỗi.)
   - Sau khi deploy xong, Google hiện ra 1 **Web app URL** dạng: `https://script.google.com/macros/s/AKfycb.../exec`. **Copy chính xác URL này.**

5. **Dán URL vào code**: mở file `src/services/api.js` trong project, thay dòng:
   ```js
   const URL = "DÁN_URL_WEB_APP_CỦA_BẠN_VÀO_ĐÂY";
   ```
   bằng URL bạn vừa copy ở bước 4.

6. **Kiểm tra hoạt động**: chạy `npm run dev`, chơi thử 1 ván cho đến khi ghép hết cặp hoặc hết giờ. Sau đó mở lại Google Sheet — sẽ thấy sheet `LichSu1939_1945` tự động xuất hiện với 3 cột `Tên / Điểm / Thời gian` và dòng kết quả vừa chơi. Nếu chưa thấy, đợi vài giây rồi bấm F5 làm mới Sheet.

7. **Khi cập nhật code sau này**: nếu bạn sửa lại `Code.gs`, phải **Deploy lại** (Deploy → Manage deployments → biểu tượng bút chì → chọn version mới → Deploy) thì thay đổi mới có hiệu lực — sửa trực tiếp trong trình soạn thảo mà không deploy lại sẽ không cập nhật cho Web App đang chạy.

Script sử dụng sheet `LichSu1939_1945` với các cột:

- A: `Tên`
- B: `Điểm`
- C: `Thời gian`

Mỗi người chơi được nhận diện qua 1 mã 4 số ngẫu nhiên lưu trong trình duyệt (`#1234` sau tên) — chơi lại nhiều lần trên cùng máy sẽ cập nhật đè lên điểm cao nhất của chính người đó, không tạo dòng mới mỗi lần chơi.
