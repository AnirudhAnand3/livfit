import * as Haptics from "expo-haptics";

export function hapticSetComplete() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
export function hapticExerciseComplete() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
export function hapticSessionComplete() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
