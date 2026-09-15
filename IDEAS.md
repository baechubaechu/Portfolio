# 나중에 해볼 것

## 얼굴로 천구 돌리기

마우스 이동 대신 [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker)로 고개 방향(yaw / pitch)을 읽어, 지금 포인터가 하던 천구 시선을 얼굴이 맡는다.

- 웹캠 프레임 → 얼굴 랜드마크 → 머리 회전 → 기존 `yawT` / `pitchT`에 넣는다. 투영·별자리·카드는 그대로 둔다.
- 얼굴이 안 잡히거나 권한을 거절하면 지금처럼 마우스로 돌아간다.
- 고개가 살짝 흔들려도 하늘이 덜덜 거리면 안 되므로, 마우스보다 조금 더 부드럽게 따라가게 한다.
- 호버 카드는 화면 중앙(바라보는 점) 근처 별에 띄울지, 커서는 따로 둘지 구현할 때 정한다.
