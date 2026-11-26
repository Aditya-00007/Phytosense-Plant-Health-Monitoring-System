import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import DiagnosisHeader from '../../components/DiagnosisHeader';
import InfoList from '../../components/InfoList';
import Button from '../../components/Button';
import { useLanguage } from '../../context/LanguageContext';
import { spacing } from '../../theme';

export default function ResultView({ route, navigation }) {
  const { diagnosis } = route.params;
  const { t } = useLanguage();
  return (
    <ScreenContainer>
      <DiagnosisHeader diagnosis={diagnosis} />
      <ResponsiveGrid>
        <InfoList title="Possible Causes" icon="warning" items={diagnosis.causes} />
        <InfoList title="Treatment" icon="medkit" items={diagnosis.treatment} />
        <InfoList title="Prevention" icon="shield-checkmark" items={diagnosis.prevention} />
        <InfoList title="Irrigation Guidance" icon="water" items={diagnosis.irrigation} />
      </ResponsiveGrid>
      <Button title={t('Scan another plant')} onPress={() => navigation.replace('Scan')} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}
