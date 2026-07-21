// AKVARYUM — independent volume, bioload and behavior results

(function attachEngineDomainResults(global) {
  'use strict';

  if (!global.Engine || typeof global.Engine.analyze !== 'function') {
    throw new Error('Bağımsız motor sonuçları, window.Engine.analyze bulunmadan yüklenemez.');
  }

  const VERSION = 1;
  const originalAnalyze = global.Engine.analyze.bind(global.Engine);
  const BEHAVIOR_TEXT = /avlayabilir|may prey|savaşır|fight|agresif|aggression|çatış|conflict|yüzgeç çekiştirme|fin nipping/i;

  function numberOrZero(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function recordMap() {
    const canonical = global.DB?.inhabitants || [];
    const legacy = global.DB?.fish || [];
    const records = new Map();
    for (const record of legacy) records.set(record.id, record);
    for (const record of canonical) records.set(record.id, record);
    return records;
  }

  function minVolume(record) {
    return numberOrZero(record?.tank?.minVolumeL ?? record?.minVolume);
  }

  function minLength(record) {
    return numberOrZero(record?.tank?.minLengthCm);
  }

  function percentage(numerator, denominator) {
    if (!(denominator > 0)) return null;
    return Math.round((numerator / denominator) * 100);
  }

  function capacityStatus(required, available) {
    if (!(available > 0)) return 'not_evaluated';
    if (required > available) return 'critical';
    if (required > available * 0.85) return 'warning';
    return 'good';
  }

  function lengthStatus(required, available) {
    if (!(required > 0) || !(available > 0)) return 'not_evaluated';
    if (required > available) return 'critical';
    if (required > available * 0.9) return 'warning';
    return 'good';
  }

  function strongestStatus(...values) {
    if (values.includes('critical')) return 'critical';
    if (values.includes('warning')) return 'warning';
    if (values.includes('good')) return 'good';
    return 'not_evaluated';
  }

  function selectedRecords(state) {
    const byId = recordMap();
    return (state?.fish || [])
      .map((selection) => ({
        id: selection.id,
        qty: Math.max(0, Number(selection.qty || 0)),
        record: byId.get(selection.id),
      }))
      .filter((selection) => selection.record && selection.qty > 0);
  }

  function volumeDomain(state, selections) {
    const tankVolumeL = numberOrZero(state?.volume);
    const tankLengthCm = numberOrZero(state?.tankLengthCm) || null;
    const requiredVolumeL = selections.reduce((maximum, selection) => (
      Math.max(maximum, minVolume(selection.record))
    ), 0);
    const requiredLengthCmValue = selections.reduce((maximum, selection) => (
      Math.max(maximum, minLength(selection.record))
    ), 0);
    const requiredLengthCm = requiredLengthCmValue || null;
    const volumeStatus = selections.length > 0
      ? capacityStatus(requiredVolumeL, tankVolumeL)
      : 'not_evaluated';
    const measuredLengthStatus = selections.length > 0
      ? lengthStatus(requiredLengthCmValue, tankLengthCm)
      : 'not_evaluated';

    return {
      status: strongestStatus(volumeStatus, measuredLengthStatus),
      volumeStatus,
      lengthStatus: measuredLengthStatus,
      tankVolumeL,
      requiredVolumeL,
      volumeMarginL: tankVolumeL > 0 ? Math.round(tankVolumeL - requiredVolumeL) : null,
      utilizationPct: percentage(requiredVolumeL, tankVolumeL),
      tankLengthCm,
      requiredLengthCm,
      method: 'largest_species_minimum_v1',
    };
  }

  function bioloadDomain(state, result, selections) {
    const tankVolumeL = numberOrZero(state?.volume);
    const demandLiters = numberOrZero(result?.neededVol);
    const status = selections.length > 0
      ? capacityStatus(demandLiters, tankVolumeL)
      : 'not_evaluated';

    return {
      status,
      tankVolumeL,
      demandLiters,
      capacityPct: percentage(demandLiters, tankVolumeL),
      marginLiters: tankVolumeL > 0 ? Math.round(tankVolumeL - demandLiters) : null,
      method: 'legacy_additive_stocking_proxy_v1',
      confidence: 'low',
      noteKey: 'legacy_stocking_proxy_not_measured_waste',
    };
  }

  function isBehaviorFinding(finding) {
    const ruleId = String(finding?.ruleId || '');
    if (ruleId.startsWith('SOCIAL_') || ruleId.startsWith('CONSPECIFIC_') || ruleId.startsWith('CONGENERIC_')) {
      return true;
    }
    if (ruleId === 'SCHOOLING_MINIMUM') return true;
    if (ruleId === 'PAIRWISE_INCOMPATIBLE' || ruleId === 'PAIRWISE_CAUTION') {
      return BEHAVIOR_TEXT.test(`${finding?.reason || ''} ${finding?.desc || ''}`);
    }
    return false;
  }

  function behaviorDomain(result, selections) {
    if (selections.length === 0) {
      return {
        status: 'not_evaluated',
        criticalCount: 0,
        warningCount: 0,
        ruleIds: [],
        compatiblePairs: 0,
        cautionPairs: 0,
        incompatiblePairs: 0,
        method: 'behavior_findings_v1',
      };
    }

    const criticalFindings = (result?.issues || []).filter(isBehaviorFinding);
    const warningFindings = (result?.warnings || []).filter(isBehaviorFinding);
    const pairEntries = (result?.compat || []).filter((entry) => entry.a !== entry.b);
    const ruleIds = [...new Set([
      ...criticalFindings.map((finding) => finding.ruleId),
      ...warningFindings.map((finding) => finding.ruleId),
    ])];

    return {
      status: criticalFindings.length > 0 ? 'critical' : warningFindings.length > 0 ? 'warning' : 'good',
      criticalCount: criticalFindings.length,
      warningCount: warningFindings.length,
      ruleIds,
      compatiblePairs: pairEntries.filter((entry) => entry.status === 'ok').length,
      cautionPairs: pairEntries.filter((entry) => entry.status === 'warn').length,
      incompatiblePairs: pairEntries.filter((entry) => entry.status === 'bad').length,
      method: 'behavior_findings_v1',
    };
  }

  global.Engine.analyze = function analyzeWithDomainResults(state) {
    const result = originalAnalyze(state);
    const selections = selectedRecords(state);
    result.domains = {
      version: VERSION,
      volume: volumeDomain(state, selections),
      bioload: bioloadDomain(state, result, selections),
      behavior: behaviorDomain(result, selections),
    };
    return result;
  };

  global.Engine.domainResultsVersion = VERSION;
})(window);
