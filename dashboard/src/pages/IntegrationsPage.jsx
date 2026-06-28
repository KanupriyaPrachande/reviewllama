export default function IntegrationsPage() {
  const integrations = [
    {
      name: 'GitHub Webhook',
      description: 'Auto-review PRs when opened or updated. ReviewLlama posts a comment with findings + AI summary.',
      steps: [
        'Go to your GitHub repo → Settings → Webhooks → Add webhook',
        'Set Payload URL to: https://your-deployed-domain.com/webhook/github',
        'Set Content type to: application/json',
        'Set Secret to the value of GITHUB_WEBHOOK_SECRET in your .env',
        'Select event: Pull requests → click Add webhook',
      ],
    },
    {
      name: 'Email Notifications',
      description: 'Get an email report when critical issues are found. Works with Gmail or any SMTP provider.',
      steps: [
        'Set EMAIL_ENABLED=true in your .env file',
        'Set SMTP_USERNAME=your_gmail@gmail.com',
        'Set SMTP_PASSWORD to a Gmail App Password (not your real password)',
        'Get App Password at: myaccount.google.com/apppasswords',
        'Set NOTIFICATION_EMAILS=you@example.com',
        'Restart the backend',
      ],
    },
    {
      name: 'Gemini AI Summary',
      description: 'Adds natural language PR summaries and code quality scores on top of the ML classifier.',
      steps: [
        'Go to aistudio.google.com and sign in with Google',
        'Click Get API key → Create API key',
        'Set GEMINI_API_KEY=your-key in your .env file',
        'Restart the backend',
        'Submit any review — a summary card appears with findings',
      ],
    },
  ]

  return (
    <main className="flex-1 overflow-y-auto px-7 py-6 font-ui flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-semibold text-text-primary mb-1">Integrations</h2>
        <p className="text-[14px] text-text-secondary">All integrations are built — just need configuration in your <span className="font-mono text-[13px] bg-bg-inset px-1.5 py-0.5 rounded">.env</span> file.</p>
      </div>
      {integrations.map(intg => (
        <div key={intg.name} className="bg-bg-panel rounded-2xl p-5 shadow-[0_2px_14px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-diff-add" />
            <h3 className="text-[15px] font-semibold text-text-primary">{intg.name}</h3>
            <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-diff-addBg text-diff-add ml-auto">Ready to configure</span>
          </div>
          <p className="text-[13px] text-text-secondary leading-relaxed mb-4">{intg.description}</p>
          <div className="bg-bg-inset rounded-xl p-4">
            <div className="text-[12px] font-semibold text-text-tertiary uppercase tracking-wide mb-2">Setup steps</div>
            <ol className="flex flex-col gap-1.5">
              {intg.steps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-text-secondary">
                  <span className="font-mono text-text-tertiary shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ))}
    </main>
  )
}