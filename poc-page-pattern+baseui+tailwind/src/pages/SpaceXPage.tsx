import { useState } from 'react';
import { useGetLaunchesQuery, useGetRocketsQuery } from '../graphql/spacex';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setView } from '../store/slices/spacexSlice';
import { Page, PageHeader } from '../components/patterns';
import { Button } from '../components/ui';

export function SpaceXPage() {
  const dispatch = useAppDispatch();
  const { currentView: view, launchesLimit, rocketsLimit } = useAppSelector((state) => state.spacex);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: launches, isLoading: launchesLoading, error: launchesError } = useGetLaunchesQuery({ limit: launchesLimit });
  const { data: rockets, isLoading: rocketsLoading, error: rocketsError } = useGetRocketsQuery({ limit: rocketsLimit });

  const handleViewChange = (newView: 'launches' | 'rockets') => {
    dispatch(setView(newView));
  };

  const filteredLaunches = launches?.filter(launch => 
    launch.mission_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    launch.rocket?.rocket_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRockets = rockets?.filter(rocket => 
    rocket.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rocket.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Page>
      <PageHeader
        title="SpaceX Data Explorer"
        description="Explore SpaceX launches and rockets from the public GraphQL API"
      />

      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search missions, rockets..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={view === 'launches' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleViewChange('launches')}
        >
          Launches ({launches?.length || 0})
        </Button>
        <Button
          variant={view === 'rockets' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleViewChange('rockets')}
        >
          Rockets ({rockets?.length || 0})
        </Button>
      </div>

      {view === 'launches' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Launches</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredLaunches?.length || 0} of {launches?.length || 0} launches
            </p>
          </div>
          <div className="p-6">
            {launchesLoading ? (
              <div className="text-center py-8 text-gray-500">Loading launches...</div>
            ) : launchesError ? (
              <div className="text-center py-8 text-red-600">Error loading launches</div>
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
                    {filteredLaunches?.map((launch) => (
                      <tr key={launch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {launch.links?.mission_patch_small && (
                              <img
                                src={launch.links.mission_patch_small}
                                alt={launch.mission_name || ''}
                                className="h-10 w-10 rounded mr-3"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {launch.mission_name}
                              </div>
                              {launch.details && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {launch.details}
                                </div>
                              )}
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Rockets</h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredRockets?.length || 0} of {rockets?.length || 0} rockets
            </p>
          </div>
          <div className="p-6">
            {rocketsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading rockets...</div>
            ) : rocketsError ? (
              <div className="text-center py-8 text-red-600">Error loading rockets</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRockets?.map((rocket) => (
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
    </Page>
  );
}