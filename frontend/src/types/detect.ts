export type DetectionStatus = "legitimate" | "suspicious" | "phishing" | string;

export type Facts = Record<string, number>;
export type FeatureStatus = Record<string, string>;
export type FeatureSources = Record<string, string>;

export interface FeatureQuality {
  total_features: number;
  available: number;
  imputed_unknown: number;
  is_complete?: boolean;
  is_resilient_mode?: boolean;
  imputed_features: string[];
}

export interface TriggeredRule {
  code?: string;
  conclusion?: DetectionStatus;
  severity?: string;
  explanation?: string;
  source?: string;
}

export interface ExpertSystemResult {
  initial_status?: DetectionStatus;
  total_triggered_rules?: number;
  triggered_rules?: TriggeredRule[];
}

export interface MachineLearningModelResult {
  name: string;
  algorithm: string;
  prediction: DetectionStatus;
  confidence: number | null;
  available?: boolean;
}

export interface MachineLearningResult {
  available: boolean;
  mode?: string;
  note?: string;
  primary_model?: MachineLearningModelResult | null;
  comparison_model?: MachineLearningModelResult | null;
  feature_set?: {
    type: string;
    total_features: number;
  };
}

export interface DetectResponse {
  analysis_mode?: string;
  url?: string;
  normalized_url?: string;
  hostname?: string;
  facts?: Facts;
  feature_status?: FeatureStatus;
  feature_sources?: FeatureSources;
  feature_quality?: FeatureQuality;
  expert_system?: ExpertSystemResult;
  machine_learning?: MachineLearningResult;
  final_result?: DetectionStatus;
  note?: string;
}
