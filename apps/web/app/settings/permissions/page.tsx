import DashboardLayout from '../../../components/dashboard-layout';

const permissionCategories = [
  {
    name: 'Job Management',
    permissions: [
      { name: 'Create Jobs', description: 'Create new construction jobs', roles: ['Administrator', 'Project Manager'] },
      { name: 'Edit Jobs', description: 'Modify existing job details', roles: ['Administrator', 'Project Manager'] },
      { name: 'Delete Jobs', description: 'Remove jobs from system', roles: ['Administrator'] },
      { name: 'View All Jobs', description: 'Access to all jobs in system', roles: ['Administrator', 'Project Manager'] },
      { name: 'Assign Crews', description: 'Assign crew members to jobs', roles: ['Administrator', 'Project Manager', 'Crew Leader'] },
    ]
  },
  {
    name: 'Crew Management',
    permissions: [
      { name: 'Manage Crew Members', description: 'Add, edit, or remove crew members', roles: ['Administrator', 'Project Manager'] },
      { name: 'View Crew Schedules', description: 'Access crew scheduling information', roles: ['Administrator', 'Project Manager', 'Crew Leader'] },
      { name: 'Update Crew Status', description: 'Update crew member availability and status', roles: ['Administrator', 'Project Manager', 'Crew Leader'] },
      { name: 'View Crew Performance', description: 'Access crew performance metrics', roles: ['Administrator', 'Project Manager'] },
    ]
  },
  {
    name: 'Document Management',
    permissions: [
      { name: 'Upload Documents', description: 'Upload files and documents', roles: ['Administrator', 'Project Manager', 'Crew Leader'] },
      { name: 'Delete Documents', description: 'Remove documents from system', roles: ['Administrator', 'Project Manager'] },
      { name: 'Share Documents', description: 'Share documents with other users', roles: ['Administrator', 'Project Manager', 'Crew Leader'] },
      { name: 'View All Documents', description: 'Access all documents in system', roles: ['Administrator', 'Project Manager'] },
    ]
  },
  {
    name: 'System Administration',
    permissions: [
      { name: 'User Management', description: 'Create, edit, and delete user accounts', roles: ['Administrator'] },
      { name: 'System Settings', description: 'Modify system configuration', roles: ['Administrator'] },
      { name: 'Backup Management', description: 'Manage system backups', roles: ['Administrator'] },
      { name: 'View Audit Logs', description: 'Access system audit and activity logs', roles: ['Administrator'] },
      { name: 'API Management', description: 'Manage API keys and integrations', roles: ['Administrator'] },
    ]
  }
];

const roles = ['Administrator', 'Project Manager', 'Crew Leader', 'Worker'];

export default function PermissionsPage() {
  return (
    <DashboardLayout title="Permissions" subtitle="Configure role-based access control and feature permissions">
      <div className="space-y-8">
        {/* Role Overview */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Role Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {roles.map((role, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-2">{role}</h3>
                <div className="text-sm text-gray-400 mb-3">
                  {role === 'Administrator' && 'Full system access'}
                  {role === 'Project Manager' && 'Manage projects and crews'}
                  {role === 'Crew Leader' && 'Lead crews and update progress'}
                  {role === 'Worker' && 'View tasks and update status'}
                </div>
                <div className="text-xs text-gray-500">
                  {permissionCategories.reduce((total, category) => 
                    total + category.permissions.filter(p => p.roles.includes(role)).length, 0
                  )} permissions
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Permission Matrix</h2>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Save Changes
            </button>
          </div>
          
          {permissionCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="border-b border-gray-700 last:border-b-0">
              <div className="px-6 py-4 bg-gray-900">
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/2">
                        Permission
                      </th>
                      {roles.map((role) => (
                        <th key={role} className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {category.permissions.map((permission, permissionIndex) => (
                      <tr key={permissionIndex} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white font-medium">{permission.name}</div>
                            <div className="text-gray-400 text-sm">{permission.description}</div>
                          </div>
                        </td>
                        {roles.map((role) => (
                          <td key={role} className="px-3 py-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                defaultChecked={permission.roles.includes(role)}
                                className="sr-only peer" 
                              />
                              <div className="w-6 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-orange-500 rounded peer peer-checked:after:translate-x-0 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 peer-checked:after:content-['✓'] peer-checked:after:text-orange-500 peer-checked:after:text-xs peer-checked:after:flex peer-checked:after:items-center peer-checked:after:justify-center peer-checked:after:font-bold"></div>
                            </label>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Permissions */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Custom Permissions</h2>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Create Custom Permission
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">Emergency Job Access</h3>
                  <p className="text-gray-400 text-sm">Allow access to emergency jobs outside normal permissions</p>
                  <div className="mt-2 flex space-x-2">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Crew Leader</span>
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Project Manager</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-500 hover:text-blue-400 text-sm">Edit</button>
                  <button className="text-red-500 hover:text-red-400 text-sm">Delete</button>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-semibold">Client Communication</h3>
                  <p className="text-gray-400 text-sm">Direct communication with clients and stakeholders</p>
                  <div className="mt-2 flex space-x-2">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Project Manager</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-500 hover:text-blue-400 text-sm">Edit</button>
                  <button className="text-red-500 hover:text-red-400 text-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Permission Templates */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Permission Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Basic Worker</h3>
              <p className="text-gray-400 text-sm mb-4">Standard permissions for field workers</p>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                Apply Template
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Team Lead</h3>
              <p className="text-gray-400 text-sm mb-4">Enhanced permissions for team leaders</p>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                Apply Template
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Site Manager</h3>
              <p className="text-gray-400 text-sm mb-4">Comprehensive site management permissions</p>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                Apply Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}