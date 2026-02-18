import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityScoreCard = ({ connectedCount, totalCount, securityScore }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return 'ShieldCheck';
    if (score >= 60) return 'Shield';
    return 'ShieldAlert';
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
      <h2 className="text-xl lg:text-2xl font-semibold text-foreground mb-6">
        Account Security Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon name="Link" size={28} color="var(--color-primary)" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Connected Methods</p>
            <p className="text-3xl font-bold text-foreground data-text">
              {connectedCount}/{totalCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full ${getScoreBg(securityScore)} flex items-center justify-center`}>
            <Icon name={getScoreIcon(securityScore)} size={28} color={`var(--color-${securityScore >= 80 ? 'success' : securityScore >= 60 ? 'warning' : 'error'})`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Security Score</p>
            <p className={`text-3xl font-bold ${getScoreColor(securityScore)} data-text`}>
              {securityScore}%
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} color="var(--color-primary)" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">
              Improve Your Security
            </h4>
            <p className="text-xs text-muted-foreground">
              Connect all available payment methods and enable two-factor authentication to increase your security score to 100%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityScoreCard;