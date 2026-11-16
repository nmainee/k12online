# Nâng cấp (evaluate + upgrade) — Giao diện hệ thống OKR VHV, toàn app (2026-11-16)

## Phạm vi & giai đoạn

- Giai đoạn: `evaluate` rồi `upgrade`, gộp một bản. Phạm vi: toàn app `frontend/` (web, máy tính là chính, có responsive).
- Đầu vào: tài liệu yêu cầu `docs/Đồ án tốt nghiệp Hà Ngọc Mai.docx` (mục 3.1, 3.2, 3.4) và mã frontend hiện có.
- Không nằm trong phạm vi: backend, CSDL, prototype HTML (chưa được yêu cầu).

## Ngữ cảnh đã nạp

- Chưa có file ngữ cảnh nào (`docs/product-design/context/` trống). Đã tạo file đánh dấu `PRODUCT-DESIGN.md` với đường dẫn mặc định.
- Hướng dẫn L0 đã nạp: KEY, ROLE, HOME, NAV, SHELL, CRUD, INPUT, FLOW, FORM, STATE, VIS, A11Y, COPY, CONS, ARC, AI.
- **Nguồn thiếu**: repo không có `docs/dev-manual/` (luật VHV `15_uiux_rules/`) và không dùng `@vsystem/shared`. Chạy tiếp với L0 và tài liệu yêu cầu, không trích luật VHV.

## Giả định

1. Cả ba vai trò (Nhân viên, Trưởng phòng, Giám đốc) là nhân viên văn phòng dùng máy tính, thành thạo trung bình: archetype B, riêng Trưởng phòng và Giám đốc nghiêng về C (mật độ cao hơn). Sai thì mật độ và giọng điệu cần chỉnh.
2. Tần suất lấy từ tài liệu: TodayList hằng ngày, check-in theo tuần (nháp bất cứ lúc nào), họp và review đầu tuần, OKR công ty theo tháng. Số bước dưới đây là **ước tính từ mã**, chưa đo với người dùng thật.
3. Nơi lưu đặc tả là `docs/product-design/` (mặc định của skill); chưa hỏi người dùng. Có thể dời.
4. Dữ liệu là dữ liệu mẫu; chưa có trạng thái tải và lỗi từ máy chủ.

## Điểm then chốt

### Bản đồ khó khăn (KEY-01)

| Vai trò | Khó khăn lớn nhất (ước tính từ luồng trong mã) |
|---|---|
| Nhân viên | Mỗi ngày mở app phải cuộn qua banner, vòng 5 bước và 4 thẻ số (khoảng 810px) mới thấy "Việc cần làm"; thêm một TodayList mất 3 màn và có 9 trường dù chỉ 1 trường bắt buộc; đổi trạng thái một việc mất 4 thao tác qua 2 trang |
| Trưởng phòng | Duyệt OKR của nhóm đi qua 5 bước (Dashboard → OKRs → đổi phạm vi sang "Cấp dưới" → từng OKR → Duyệt); mỗi tuần phải duyệt và review từng người một, không có chỗ gom |
| Giám đốc | Muốn thấy OKR công ty được nhóm và cá nhân nối vào ra sao thì phải đọc dòng chữ "gắn với …" trên từng thẻ và đổi phạm vi nhiều lần |

### Bảng chấm (KEY-02: tần suất × chi phí × rủi ro)

| # | Khó khăn | Tần suất | Chi phí | Rủi ro | Điểm |
|---|---|---|---|---|---|
| 1 | Điểm vào không phải bàn làm việc, việc cần làm nằm dưới nếp gấp, số không bấm được | hằng ngày × 3 vai trò | cuộn 810px, 3–5 bước đến việc | 2 | **cao nhất** |
| 2 | Thêm và đổi trạng thái TodayList quá nhiều bước | hằng ngày × nhân viên | 4 thao tác, 2 trang, 9 trường | 1 | cao |
| 3 | Liên kết OKR giữa các cấp không nhìn thấy | hằng tuần × trưởng phòng, giám đốc | đọc từng thẻ | 2 (lệch mục tiêu) | cao |

Hạng 4 trở đi (hộp xác nhận mặc định của trình duyệt, nhóm menu một mục) nằm ở phần rà rộng.

### Điểm then chốt 1 — Điểm vào chưa phải bàn làm việc (HOME-01, HOME-07)

1. **Hiện trạng** (nhân viên): đăng nhập → Dashboard → cuộn qua banner (≈290px), vòng 5 bước (≈180px), 4 thẻ số (≈130px) → thấy "Việc cần làm" ở khoảng y = 810px, ngoài màn 900px. Trưởng phòng: 5 bước để duyệt một OKR.
2. **Gốc rễ**: Dashboard vừa là tổng quan vừa là bàn làm việc nhưng thứ tự theo mức "trang trí trước, việc sau"; các số (TodayList 1/5, "Chưa xong") không dẫn sang danh sách tương ứng; việc cần duyệt của cấp trên chỉ có đường dẫn chữ, không làm được ngay tại chỗ.
3. **Phương án**: (a) giữ nguyên, chỉ thu nhỏ banner; (b) **bàn làm việc ở trên, tổng quan ở dưới** (Việc cần làm, và với cấp trên là "Cần bạn duyệt" làm được ngay, đứng đầu; banner thu gọn thành một dải chào; vòng 5 bước và số liệu xuống dưới, số bấm được); (c) tách hai trang. Chọn (b): không thêm trang, giải quyết được nhịp hằng ngày.
4. **Khuyến nghị**: làm (b). Cấp trên duyệt hoặc yêu cầu sửa OKR ngay trên Dashboard, xác nhận nêu số lượng (FLOW-11). Mỗi thẻ số bấm vào mở danh sách đã lọc (HOME-07).
5. **Chỉ số trước → sau**: vị trí "Việc cần làm" 810px → 315px (**đã đo** trên màn 1440×900 sau khi làm, nằm trong màn đầu); duyệt một OKR 5 bước, 2 lần chuyển trang → 1–2 bước, 0 lần chuyển trang.
6. **Rủi ro**: Dashboard dài hơn cho Giám đốc; giảm bằng cách gom tổng quan thành hai cột. Người mới mất "cảm giác tuần" từ cảnh leo núi: giữ cảnh nhỏ trong banner thu gọn.

### Điểm then chốt 2 — TodayList tốn bước mỗi ngày (FLOW-03, FLOW-04, FORM-01)

1. **Hiện trạng**: thêm việc: Dashboard → TodayList → "Tạo TodayList" → điền tên → chọn OKR → "Tạo" = 4 thao tác, 2 lần chuyển trang, 9 trường (1 bắt buộc). Đổi trạng thái: bấm thẻ → trang chi tiết → đổi ô chọn → "Lưu thay đổi" = 4 thao tác, 2 lần chuyển trang.
2. **Gốc rễ**: form đầy đủ là đường duy nhất; trạng thái chỉ đổi được trong form. Đúng với 3.4.8 của tài liệu (màn "Tạo TodayList") nhưng tài liệu không cấm lối nhanh.
3. **Phương án**: (a) giữ form; (b) **thêm dòng nhập nhanh** (tên + Enter, OKR lấy mặc định là OKR đang làm, hạn là cuối hôm nay, ưu tiên Trung bình) và **nút đổi trạng thái 1 chạm** trên thẻ, giữ form đầy đủ cho khi cần mô tả, đính kèm; (c) kéo thả giữa các cột (không dùng được bằng bàn phím nếu không làm thêm). Chọn (b).
4. **Khuyến nghị**: làm (b). Giữ màn 3.4.8 như đường đầy đủ.
5. **Chỉ số**: thêm việc 4 thao tác, 2 trang, 9 trường → 2 thao tác (bấm ô, gõ tên và Enter), 0 trang, 1 trường; đổi trạng thái 4 thao tác, 2 trang → 1 thao tác.
6. **Rủi ro**: tạo nhầm việc (hoàn tác bằng nút "Hoàn tác" trong thông báo); mặc định OKR sai khi có nhiều OKR (nhớ lựa chọn gần nhất, có ô chọn bên cạnh).

### Điểm then chốt 3 — Liên kết OKR giữa các cấp không nhìn thấy (CRUD-05, ROLE-04)

1. **Hiện trạng**: quan hệ công ty → nhóm → cá nhân chỉ là một dòng chữ "gắn với …" trên thẻ; muốn thấy cả chuỗi phải đổi phạm vi ba lần.
2. **Gốc rễ**: danh sách phẳng; tài liệu nhấn mạnh "Liên kết mục tiêu giữa các cấp để đảm bảo tính thống nhất" (3.1.2) nhưng giao diện không cho thấy kết quả của việc liên kết.
3. **Phương án**: (a) giữ danh sách, thêm bộ lọc theo OKR cha; (b) **thêm dạng xem "Cây liên kết"** (công ty → nhóm → cá nhân, mỗi nút có tiến độ và trạng thái) cạnh dạng danh sách; (c) sơ đồ mạng. Chọn (b).
4. **Khuyến nghị**: làm (b); dạng cây là dạng xem mặc định của Giám đốc, danh sách là mặc định của nhân viên.
5. **Chỉ số**: đọc một chuỗi liên kết 3 lần đổi phạm vi → 0; số cuộn để thấy OKR của cả nhóm → 1 màn.
6. **Rủi ro**: cây quá sâu khi có nhiều OKR (thu gọn theo nhánh, nhớ trạng thái).

## Vai trò và phương án

| Vai trò | Archetype (giả định) | Điểm vào | Tác vụ số 1 |
|---|---|---|---|
| Nhân viên | B | Bàn làm việc: việc cần làm hôm nay, check-in đến hạn | Làm TodayList, check-in cuối tuần |
| Trưởng phòng | B/C | Bàn làm việc có "Cần bạn duyệt" | Duyệt OKR, review check-in |
| Giám đốc | C | Tổng quan công ty + "Cần bạn duyệt" | Theo dõi tiến độ, duyệt OKR công ty |

Khung giữ nguyên: sidebar trái + thanh trên (3 vai trò đều dưới 10 đích đến cấp 1; SHELL-02).

## Phương án cải tiến

**Định hướng thị giác và tokens** (chỉ phần đổi): giữ bảng màu teal / vàng hổ phách và linh vật Tiêu. Siết **thang chữ về 7 bậc** 12 / 14 / 16 / 18 / 22 / 28 / 36 px (hiện có 19 cỡ lẻ như 12.5, 13.5, 14.5, 17, 26, 30, 34; VIS-02). Vùng chạm tối thiểu 44px trên màn cảm ứng (A11Y-01).

**Bố cục mới — Dashboard (Trước → Sau)**

Trước:
```
┌ Banner chào + cảnh leo núi (≈290px) ───────────────┐
├ Vòng 5 bước (≈180px) ──────────────────────────────┤
├ [68%] [1/5] [Chưa xong] [120 điểm]  (không bấm được)┤
├ OKR của bạn            │ Việc cần làm (y≈810px)    │
```
Sau:
```
┌ Chào, Quân · Tuần 47 · Còn 6 ngày    [Đi tới check-in] ┐
├ Việc cần làm hôm nay            │ Cần bạn duyệt (cấp trên)┤
│ [+ Thêm việc… Enter]            │ Lê M. Quân · OKR tuần 47 │
│ ▢ Viết API lưu check-in  [Xong] │ [Yêu cầu sửa] [Duyệt]    │
├ Vòng OKR tuần 47 (5 bước, thu gọn)                        ┤
├ [OKR 68% ›] [TodayList 1/5 ›] [Check-in ›] [Điểm 120 ›]   ┤
```

## Tối ưu thao tác

| Vai trò | Tác vụ ưu tiên | Tần suất × chi phí |
|---|---|---|
| Nhân viên | Thêm việc, đổi trạng thái việc, check-in cuối tuần | hằng ngày × 4 thao tác |
| Trưởng phòng | Duyệt OKR, review check-in | hằng tuần × 5 bước |
| Giám đốc | Xem chuỗi OKR công ty → cá nhân | hằng tuần × 3 lần đổi phạm vi |

**Kỹ thuật** (đã chốt): nhập nhanh TodayList (đã chọn); kéo thả giữa cột TodayList (quyết định: không làm); duyệt hàng loạt OKR (đã làm cho "Cần bạn duyệt" có từ 2 mục trở lên, có xác nhận nêu số lượng); lưu nháp check-in tự động (làm khi nối backend).

Chỉ tiêu kiểm lại sau khi làm: vị trí "Việc cần làm", số thao tác thêm/đổi trạng thái việc, số thao tác duyệt OKR, số lần đổi phạm vi để đọc một chuỗi OKR.

## Theo nhóm hướng dẫn đã áp

- **Phù hợp vai trò — 3,5/5.** Điểm vào chưa phục vụ tác vụ số 1 (đã nằm trong điểm then chốt 1). Menu đã lọc theo quyền (NAV-07 đạt). Người dùng bị đẩy về Dashboard lặng lẽ khi vào trang không có quyền (ROLE-06, P2): sửa bằng trang "Bạn chưa có quyền" kèm lý do và đường về.
- **Cấu trúc — 4/5.** Nhóm "Tổng quan" chỉ có 1 mục `Dashboard` (NAV-08, P1: nhóm một mục là lỗi) → bỏ tiêu đề nhóm. Khung không đổi giữa các trang (SHELL-04 đạt).
- **UX — 3/5.** Hộp xác nhận mặc định của trình duyệt khi xóa OKR, tài khoản, TodayList (`Okrs.jsx:39`, `Accounts.jsx:24`, `Today.jsx:134`) không nêu số lượng và không phân ba trường hợp (FLOW-11, CRUD-03, P2) → hộp xác nhận riêng.
- **Đầy đủ UI — 3,5/5.** Ma trận vòng đời CRUD (CRUD-01): OKR đủ Thêm/Sửa/Xóa, thiếu xóa hàng loạt; TodayList thiếu Hoàn tác; Tài khoản thiếu chọn nhiều để khóa/xóa (CRUD-02, P2) → chọn nhiều ở Tài khoản. Chưa có trạng thái đang tải/lỗi/ngoại tuyến vì chưa có API (STATE-01, ghi nhận, làm khi nối backend).
- **Nhất quán — 4/5.** Thang chữ 19 cỡ lẻ (CONS, VIS-02, P2) → siết còn 7 bậc. Nhãn "Đã duyệt" dùng cho cả OKR lẫn check-in ở bảng trạng thái (CONS-02, P3): giữ theo tài liệu, ghi vào quyết định chờ chọn.
- **Thẩm mỹ — 4/5.** Hình minh họa và màu thống nhất. Trang điểm vào dành quá nhiều diện tích cho trang trí so với việc cần làm (VIS-01, đã nằm trong điểm then chốt 1).
- **Tiếp cận — 3,5/5.** `.btn.sm` chỉ cao khoảng 30px (A11Y-01, P2) → 44px trên màn cảm ứng. Focus nhìn rõ (A11Y-02 đạt). Giảm chuyển động có xử lý (A11Y-04 đạt). Trạng thái kèm chữ, không chỉ màu (A11Y-03 đạt).
- **Cơ hội AI (AI-01).** Không đề xuất ở giai đoạn này: cách không AI (nhập nhanh, mặc định) đã giảm bước đủ, và hệ thống chưa có dữ liệu thật để AI dùng (AI-06).
- **Nhập liệu thông minh (INPUT-01).** Chỗ nhập hằng ngày duy nhất là TodayList (1 bản ghi mỗi lần): kết luận dùng dòng nhập nhanh, không cần nhập lưới hay AI. Tài khoản (thêm nhân sự mới) thỉnh thoảng mới dùng: giữ form hiện tại.

## Xung đột rule đã gặp

Không có (chưa nạp luật VHV vì repo không có `docs/dev-manual/`).

## Quyết định đã chốt (2026-11-16)

| # | Quyết định | Kết quả |
|---|---|---|
| 1 | Nhãn trạng thái check-in "Đã duyệt" | **Giữ** theo tài liệu (3.1.2), không đổi thành "Đã review" |
| 2 | Kéo thả giữa cột TodayList | **Không làm**; dùng nút "Bắt đầu" / "Xong" trên thẻ |
| 3 | Lưu nháp check-in tự động | **Làm khi nối backend** |
| 4 | Nơi lưu đặc tả | **Giữ** `docs/product-design/` |

## Đề xuất cập nhật ngữ cảnh

Chưa ghi. Nếu bạn xác nhận, đề xuất tạo `docs/product-design/context/project.md` (lớp project) gồm: ba vai trò và tần suất; archetype B/C; thang chữ 7 bậc; thuật ngữ chuẩn (OKR, KR, TodayList, Check-in, CFRs, Store); quyết định D-001 "bàn làm việc trước, tổng quan sau".

## Lộ trình

- **Quick wins (một ngày)** — đã làm trong lần này: bàn làm việc ở đầu Dashboard và thẻ số bấm được; dòng nhập nhanh và nút đổi trạng thái TodayList; bỏ nhóm menu một mục; trang "Không có quyền" và "Không tìm thấy"; hộp xác nhận riêng; vùng chạm 44px; thang chữ 7 bậc.
- **Ngắn hạn (1–2 sprint)**: cây liên kết OKR (đã làm bản đầu), duyệt hàng loạt, chọn nhiều ở Tài khoản (đã làm), trạng thái tải/lỗi khi nối API, lưu nháp check-in tự động.
- **Dài hạn**: kéo thả TodayList có bàn phím, dashboard theo vai trò (đã nêu ở hướng phát triển của tài liệu), nhắc việc thông minh.

## Kết quả đã áp vào mã (frontend/)

Đã đo bằng trình duyệt thật (1440×900): "Việc cần làm" đứng ở y = 315px (trước 810px); thêm việc bằng 1 ô nhập + Enter; đổi trạng thái 1 chạm; duyệt OKR tại Dashboard 1 thao tác (kèm Hoàn tác); cây liên kết hiển thị 6 OKR trong một màn; chọn nhiều tài khoản có hộp xác nhận nêu số lượng; trang "Bạn chưa có quyền" thay cho chuyển hướng lặng lẽ. 38 đường dẫn theo 3 vai trò không lỗi.

## Bước tiếp

Bạn xem các quyết định chờ chọn ở trên; nếu muốn xem trực quan thì tôi dựng prototype trước/sau. Giai đoạn tiếp theo gợi ý: `standardize` để chốt tokens và thuật ngữ vào file ngữ cảnh.
