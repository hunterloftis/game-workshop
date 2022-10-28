export function flappyGame(buttonPressed, player) {
  if (buttonPressed) player.flapWings();
  player.sinkDown();
  player.flyRight();
}
