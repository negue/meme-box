export interface ChannelPointRedemption {
  broadcaster_name: string;
  broadcaster_login: string;
  broadcaster_id: string;
  id: string;
  image?: null;
  background_color: string;
  is_enabled: boolean;
  cost: number;
  title: string;
  prompt: string;
  is_user_input_required: boolean;
  max_per_stream_setting: MaxPerStreamSetting;
  max_per_user_per_stream_setting: MaxPerUserPerStreamSetting;
  global_cooldown_setting: GlobalCooldownSetting;
  is_paused: boolean;
  is_in_stock: boolean;
  default_image: DefaultImage;
  should_redemptions_skip_request_queue: boolean;
  redemptions_redeemed_current_stream?: null;
  cooldown_expires_at?: null;
}
export interface MaxPerStreamSetting {
  is_enabled: boolean;
  max_per_stream: number;
}
export interface MaxPerUserPerStreamSetting {
  is_enabled: boolean;
  max_per_user_per_stream: number;
}
export interface GlobalCooldownSetting {
  is_enabled: boolean;
  global_cooldown_seconds: number;
}
export interface DefaultImage {
  url_1x: string;
  url_2x: string;
  url_4x: string;
}

export interface TwitchAuthResult {
  clientId: string;
  userId: string;
  token: string;
  login: string;
  expires_in: number;
  expires_in_date: number; // this is the timestamp when its fully expired
  scopes: string[];
  valid: boolean;
  reason?: string;
}

export interface TwitchAuthInformation {
  type: 'main'|'bot',
  authResult: TwitchAuthResult;
}
