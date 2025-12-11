import { useState } from 'react';
import { useGetLaunchesQuery, useGetRocketsQuery } from '../graphql/spacex';

export function SpaceXPage() {
  const [view, setView] = useState<'launches' | 'rockets'>('launches');
  const { data: launches, isLoading: launchesLoading } = useGetLaunchesQuery({ limit: 20 });
  const { data: rockets, isLoading: rocketsLoading } = useGetRocketsQuery({ limit: 10 });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SpaceX Data</h1>
          <p className="text-gray-600">Explore SpaceX launches and rockets from the public GraphQL API</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setView('launches')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'launches'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Launches
          </button>
          <button
            onClick={() => setView('rockets')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'rockets'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Rockets
          </button>
        </div>

        {view === 'launches' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Launches</h2>
            </div>
            <div className="p-6">
              {launchesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading launches...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mission
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rocket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {launches?.map((launch) => (
                        <tr key={launch.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {launch.links?.mission_patch_small && (
                                <img
                                  src={launch.links.mission_patch_small}
                                  alt={launch.mission_name || ''}
                                  className="h-10 w-10 rounded mr-3"
                                />
                              )}
                              <div className="text-sm font-medium text-gray-900">
                                {launch.mission_name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {launch.launch_date_utc
                              ? new Date(launch.launch_date_utc).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {launch.rocket?.rocket_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                launch.launch_success
                                  ? 'bg-green-100 text-green-800'
                                  : launch.launch_success === false
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {launch.launch_success
                                ? 'Success'
                                : launch.launch_success === false
                                ? 'Failed'
                                : 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'rockets' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Rockets</h2>
            </div>
            <div className="p-6">
              {rocketsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading rockets...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rockets?.map((rocket) => (
                    <div key={rocket.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{rocket.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            rocket.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rocket.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">Type:</span> {rocket.type}</p>
                        <p><span className="font-medium">Country:</span> {rocket.country}</p>
                        <p><span className="font-medium">Company:</span> {rocket.company}</p>
                        <p><span className="font-medium">First Flight:</span> {rocket.first_flight}</p>
                        {rocket.success_rate_pct !== null && (
                          <p><span className="font-medium">Success Rate:</span> {rocket.success_rate_pct}%</p>
                        )}
                        {rocket.cost_per_launch !== null && rocket.cost_per_launch !== undefined && (
                          <p><span className="font-medium">Cost per Launch:</span> ${(rocket.cost_per_launch / 1000000).toFixed(1)}M</p>
                        )}
                      </div>
                      {rocket.description && (
                        <p className="mt-4 text-sm text-gray-500 line-clamp-3">{rocket.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
