export const NAV_STRUCTURE = [
  {
    id: 'home',
    label: 'Home',
    children: [
      {
        id: 'configuration',
        label: 'Configuration',
        children: [
          {
            id: 'document-categories',
            label: 'Document Categories',
            children: [
              { id: 'charts', label: 'Charts' },
              { id: 'category', label: 'Category' }
            ]
          }
        ]
      }
    ]
  },
  { id: 'solutions', label: 'Solutions' },
  { id: 'custom-code', label: 'Custom Code' },
  { id: 'monitoring', label: 'Monitoring' },
  { id: 'settings', label: 'Settings' }
];
