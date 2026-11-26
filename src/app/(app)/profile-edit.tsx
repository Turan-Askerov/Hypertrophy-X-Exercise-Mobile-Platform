import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';

const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleBorder: 'rgba(139, 92, 246, 0.42)',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: 'rgba(16, 185, 129, 0.35)',
  danger: '#FB7185',
  dangerBg: 'rgba(244, 63, 94, 0.12)',
  dangerBorder: 'rgba(244, 63, 94, 0.32)',
};

const MAX_NICKNAME_LENGTH = 24;
const MIN_NICKNAME_LENGTH = 2;
const MAX_AVATAR_DATA_URI_LENGTH = 2_400_000;

async function encodeAssetToAvatarDataUri(
  asset: ImagePicker.ImagePickerAsset
): Promise<string | null> {
  if (asset.base64) {
    const mime =
      asset.mimeType && asset.mimeType.startsWith('image/')
        ? asset.mimeType
        : 'image/jpeg';
    const candidate = `data:${mime};base64,${asset.base64}`;
    if (candidate.length <= MAX_AVATAR_DATA_URI_LENGTH) {
      return candidate;
    }
  } else if (asset.uri?.startsWith('data:image/') && asset.uri.length <= MAX_AVATAR_DATA_URI_LENGTH) {
    return asset.uri;
  }

  // Web ortamında büyük veya base64'süz görselleri küçük JPEG'e dönüştür
  if (Platform.OS === 'web' && typeof document !== 'undefined' && asset.uri) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new globalThis.Image();
        el.crossOrigin = 'anonymous';
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = asset.uri;
      });
      const maxDim = 320;
      const scale = Math.min(1, maxDim / Math.max(img.width || maxDim, img.height || maxDim));
      const w = Math.max(1, Math.round((img.width || maxDim) * scale));
      const h = Math.max(1, Math.round((img.height || maxDim) * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.78);
        if (compressed.length <= MAX_AVATAR_DATA_URI_LENGTH) {
          return compressed;
        }
      }
    } catch {
      return null;
    }
  }

  return null;
}

function BackIcon({ color = colors.text, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function CameraIcon({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
      />
      <Circle cx="12" cy="13" r="4" strokeWidth={2} />
    </Svg>
  );
}

function GalleryIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={2} />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15l-5-5L5 21" />
    </Svg>
  );
}

function UserBadgeIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <Circle cx="12" cy="7" r="4" strokeWidth={2} />
    </Svg>
  );
}

function TrashIcon({ color = colors.danger, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </Svg>
  );
}

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user, updateProfile, isUpdatingProfile } = useUser();

  const savedNickname = (user?.nickname ?? '').trim();
  const savedAvatarUrl = (user?.avatar_url ?? '').trim();
  const initialNickname = savedNickname || user?.username || '';
  const [draftNickname, setDraftNickname] = useState<string | null>(null);
  const [draftAvatarUri, setDraftAvatarUri] = useState<string | undefined>(undefined);
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const nickname = draftNickname ?? initialNickname;
  const trimmedNickname = nickname.trim();
  const displayedAvatarUri =
    draftAvatarUri !== undefined ? draftAvatarUri || null : savedAvatarUrl || null;
  const displayTitle = trimmedNickname || initialNickname || 'Sporcu';
  const avatarInitials = displayTitle.slice(0, 2).toUpperCase();

  const isTooShort = trimmedNickname.length > 0 && trimmedNickname.length < MIN_NICKNAME_LENGTH;
  const isNicknameValid = trimmedNickname.length >= MIN_NICKNAME_LENGTH;
  const hasNicknameChange =
    draftNickname !== null && trimmedNickname !== initialNickname.trim();
  const hasAvatarChange =
    draftAvatarUri !== undefined && draftAvatarUri !== savedAvatarUrl;
  const hasAnyChange = hasAvatarChange || hasNicknameChange;
  const canSubmit = !isUpdatingProfile && isNicknameValid && hasAnyChange;

  const handlePickAvatarFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Galeri İzni Gerekli',
          'Profil fotoğrafı seçebilmek için cihazınızın fotoğraf galerisine erişim izni vermeniz gerekiyor.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.35,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const encoded = await encodeAssetToAvatarDataUri(asset);
        if (!encoded) {
          Alert.alert(
            'Fotoğraf Çok Büyük',
            'Seçtiğiniz fotoğraf boyutu çok yüksek. Lütfen daha küçük boyutlu veya kırpılmış bir fotoğraf seçin.'
          );
          return;
        }
        setDraftAvatarUri(encoded);
        setPickedFileName(asset.fileName || null);
      }
    } catch {
      Alert.alert('Hata', 'Galeriden fotoğraf seçilirken bir sorun oluştu.');
    }
  };

  const handleSaveProfile = async () => {
    Keyboard.dismiss();
    if (!user) return;
    if (!isNicknameValid) {
      Alert.alert('Geçersiz Takma Ad', `Takma ad en az ${MIN_NICKNAME_LENGTH} karakter olmalıdır.`);
      return;
    }
    if (!hasAnyChange) return;

    const payloadNickname =
      trimmedNickname === (user.username ?? '').trim() ? '' : trimmedNickname;

    try {
      await updateProfile({
        ...(hasNicknameChange ? { nickname: payloadNickname } : {}),
        ...(hasAvatarChange ? { avatar_url: draftAvatarUri ?? '' } : {}),
      });
      setDraftNickname(null);
      setDraftAvatarUri(undefined);
      setPickedFileName(null);
      Alert.alert('Başarılı', 'Profil bilgileriniz kaydedildi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Profil bilgileri güncellenemedi.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Üst Başlık Barı */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={10}
          accessibilityLabel="Geri Dön"
        >
          <BackIcon size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Kişisel Bilgileri Güncelle
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* 1. Canlı Profil Önizleme Kartı */}
          <Card style={styles.sectionCard}>
            <View style={styles.previewHeaderRow}>
              <Text style={styles.sectionKicker}>CANLI ÖNİZLEME</Text>
              <View style={styles.previewModePill}>
                <Text style={styles.previewModePillText}>
                  {hasAnyChange ? 'Kaydedilmemiş Değişiklik' : 'Güncel Profil'}
                </Text>
              </View>
            </View>

            <View style={styles.previewUserRow}>
              <View style={styles.previewAvatarCircle}>
                {displayedAvatarUri ? (
                  <Image
                    source={{ uri: displayedAvatarUri }}
                    style={styles.avatarImageFill}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.previewAvatarText}>{avatarInitials}</Text>
                )}
              </View>

              <View style={styles.previewInfoCol}>
                <Text style={styles.previewName} numberOfLines={1}>
                  {displayTitle}
                </Text>
                <Text style={styles.previewSubText} numberOfLines={1}>
                  {user?.email || 'E-posta eklenmedi'}
                </Text>
                {user?.username && trimmedNickname && trimmedNickname !== user.username ? (
                  <Text style={styles.previewHandleText} numberOfLines={1}>
                    Hesap: @{user.username}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>

          {/* 2. Avatar / Profil Fotoğrafı Seçimi */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionKicker}>PROFİL FOTOĞRAFI (AVATAR)</Text>

            <View style={styles.avatarEditorCenter}>
              <Pressable
                style={styles.largeAvatarWrap}
                onPress={handlePickAvatarFromGallery}
                accessibilityLabel="Galeriden avatar seç"
              >
                <View style={styles.largeAvatarCircle}>
                  {displayedAvatarUri ? (
                    <Image
                      source={{ uri: displayedAvatarUri }}
                      style={styles.avatarImageFill}
                      contentFit="cover"
                    />
                  ) : (
                    <Text style={styles.largeAvatarText}>{avatarInitials}</Text>
                  )}
                </View>
                <View style={styles.cameraBadge}>
                  <CameraIcon size={15} color="#FFFFFF" />
                </View>
              </Pressable>

              <Text style={styles.avatarHintText}>
                {hasAvatarChange
                  ? draftAvatarUri
                    ? pickedFileName || 'Yeni profil fotoğrafı seçildi'
                    : 'Mevcut profil fotoğrafı kaldırılacak'
                  : displayedAvatarUri
                    ? 'Profil fotoğrafınızı değiştirebilir veya kaldırabilirsiniz'
                    : 'Galerinizden kare bir fotoğraf seçerek avatarınızı güncelleyin'}
              </Text>

              <View style={styles.avatarButtonsRow}>
                <TouchableOpacity
                  style={styles.galleryBtn}
                  onPress={handlePickAvatarFromGallery}
                  activeOpacity={0.78}
                >
                  <GalleryIcon size={16} color={colors.purpleLight} />
                  <Text style={styles.galleryBtnText}>
                    {displayedAvatarUri ? 'Fotoğrafı Değiştir' : 'Galeriden Seç'}
                  </Text>
                </TouchableOpacity>

                {displayedAvatarUri ? (
                  <TouchableOpacity
                    style={styles.removeAvatarBtn}
                    onPress={() => {
                      setDraftAvatarUri('');
                      setPickedFileName(null);
                    }}
                    activeOpacity={0.78}
                  >
                    <TrashIcon size={14} color={colors.danger} />
                    <Text style={styles.removeAvatarBtnText}>Kaldır</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </Card>

          {/* 3. Nickname (Takma Ad) Düzenleme Kartı */}
          <Card style={styles.sectionCard}>
            <View style={styles.inputLabelRow}>
              <View style={styles.inputLabelLeft}>
                <UserBadgeIcon size={15} color={colors.purpleLight} />
                <Text style={styles.sectionKicker}>TAKMA AD (NICKNAME)</Text>
              </View>
              <Text style={styles.charCounter}>
                {nickname.length} / {MAX_NICKNAME_LENGTH}
              </Text>
            </View>

            <View
              style={[
                styles.inputBox,
                isInputFocused && styles.inputBoxFocused,
                isTooShort && styles.inputBoxError,
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={nickname}
                onChangeText={setDraftNickname}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Takma adınızı yazın"
                placeholderTextColor={colors.textDim}
                maxLength={MAX_NICKNAME_LENGTH}
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                keyboardAppearance="dark"
              />
              {nickname.length > 0 ? (
                <TouchableOpacity
                  style={styles.clearInputBtn}
                  onPress={() => setDraftNickname('')}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearInputText}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={[styles.helperText, isTooShort && styles.helperTextError]}>
              {isTooShort
                ? `Takma ad en az ${MIN_NICKNAME_LENGTH} karakter olmalıdır.`
                : trimmedNickname.length === 0
                  ? 'Profil kartında görünecek bir takma ad belirleyin.'
                  : 'Profil ekranında başlık olarak gösterilecek takma adınız.'}
            </Text>
          </Card>

          {/* 4. Bilgi Kutusu & Kaydet Butonu */}
          <View style={styles.infoNoteBox}>
            <Text style={styles.infoNoteText}>
              Takma adınız ve profil fotoğrafınız hesabınızla kaydedilir. Giriş yaparken kullandığınız hesap adınız (@{user?.username || 'sporcu'}) değişmeden korunur.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !canSubmit && styles.saveBtnDisabled]}
            onPress={handleSaveProfile}
            disabled={!canSubmit}
            activeOpacity={0.82}
          >
            {isUpdatingProfile ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.2,
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 14,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewModePill: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  previewModePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  previewUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.cardBgInner,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  previewAvatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.purpleBg,
    borderWidth: 2,
    borderColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  avatarImageFill: {
    width: '100%',
    height: '100%',
  },
  previewInfoCol: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  previewSubText: {
    fontSize: 12.5,
    color: colors.textMuted,
  },
  previewHandleText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.purpleLight,
  },
  avatarEditorCenter: {
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  largeAvatarWrap: {
    position: 'relative',
  },
  largeAvatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.purpleBg,
    borderWidth: 2.5,
    borderColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  largeAvatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.text,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.purple,
    borderWidth: 2.5,
    borderColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHintText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  avatarButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  galleryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  removeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  removeAvatarBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  charCounter: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textDim,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgInner,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  inputBoxFocused: {
    borderColor: colors.purpleLight,
  },
  inputBoxError: {
    borderColor: colors.danger,
  },
  textInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 0,
  },
  clearInputBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearInputText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  helperTextError: {
    color: colors.danger,
    fontWeight: '600',
  },
  infoNoteBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  infoNoteText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  saveBtn: {
    backgroundColor: colors.purple,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.42,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
