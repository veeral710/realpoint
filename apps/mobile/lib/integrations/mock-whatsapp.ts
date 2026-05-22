import { Alert, Linking } from "react-native";

const DEMO_MODE = __DEV__;

/**
 * Opens WhatsApp when a number exists; in local demo, still opens with a stub
 * message so the flow is testable.
 */
export async function openListingWhatsApp(
  phone: string | null | undefined,
  listingTitle: string
): Promise<void> {
  const text = `Hi, I am interested in: ${listingTitle}`;
  if (!phone?.trim()) {
    Alert.alert(
      "Demo contact",
      "No phone on this listing. In production, owner WhatsApp would appear here."
    );
    return;
  }

  const clean = phone.replace(/\D/g, "");
  const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;

  if (DEMO_MODE) {
    Alert.alert(
      "Open WhatsApp (demo)",
      `This will open WhatsApp to ${phone}.\n\nMessage: ${text}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open", onPress: () => Linking.openURL(url) },
      ]
    );
    return;
  }

  await Linking.openURL(url);
}
