-- ====================================================
-- 호박마켓 채팅 + 거래 후기 기능
-- Supabase SQL 에디터에서 전체 선택 후 실행하세요
-- ====================================================

-- 1. 채팅방 테이블
CREATE TABLE IF NOT EXISTS chat_rooms (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, buyer_id),
  CHECK (buyer_id != seller_id)
);

-- 2. 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id     uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id   uuid NOT NULL,
  content     text NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  created_at  timestamptz NOT NULL DEFAULT now(),
  read_at     timestamptz
);

-- 3. 거래 후기 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  room_id      uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  reviewer_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating       text NOT NULL CHECK (rating IN ('positive', 'negative')),
  content      text CHECK (char_length(content) <= 300),
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, reviewer_id)
);

-- 4. RLS 보안 켜기 (다른 사람 대화 못 보게)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 5. chat_rooms 정책
--    내가 구매자 or 판매자인 방만 볼 수 있음
CREATE POLICY "chat_rooms_select" ON chat_rooms FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

--    내가 구매자일 때만 방을 만들 수 있음 (내 상품에는 방 못 만듦)
CREATE POLICY "chat_rooms_insert" ON chat_rooms FOR INSERT
  WITH CHECK (buyer_id = auth.uid() AND buyer_id != seller_id);

-- 6. messages 정책
--    내가 참여한 방의 메시지만 볼 수 있음
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = messages.room_id
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

--    내가 참여한 방에만 메시지를 보낼 수 있음
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = messages.room_id
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

--    상대방이 보낸 메시지의 read_at(읽음 시각)만 업데이트 가능
CREATE POLICY "messages_update" ON messages FOR UPDATE
  USING (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = messages.room_id
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  )
  WITH CHECK (true);

-- 7. reviews 정책
--    후기는 누구나 볼 수 있음 (프로필 페이지 등)
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);

--    내가 참여한 거래에만 후기 작성 가능
CREATE POLICY "reviews_insert" ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = reviews.room_id
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- 8. messages Realtime 켜기 (실시간 채팅용)
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
