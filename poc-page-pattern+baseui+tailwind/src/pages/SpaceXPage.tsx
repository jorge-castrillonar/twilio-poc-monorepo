import { useEffect } from 'react';
import { useGetLaunchesQuery, useGetRocketsQuery, useGetCapsulesQuery, useGetShipsQuery } from '../store/spacexApi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setView, 
  setLaunchesLimit, 
  setRocketsLimit,
  setSearchTerm,
  selectCurrentView,
  selectPagination,
  selectFilters,
  type SpaceXView
} from '../store/slices/spacexSlice';
import { Page, PageHeader } from '../components/patterns';
import { Button } from '../components/ui';

export function SpaceXPage() {
  const dispatch = useAppDispatch();
  const view = useAppSelector(selectCurrentView);
  const pagination = useAppSelector(selectPagination);
  const { searchTerm } = useAppSelector(selectFilters);
  
  const { data: launches, isLoading: launchesLoading, error: launchesError } = useGetLaunchesQuery({ 
    limit: pagination.launchesLimit,
    sort: 'launch_date_utc',
    order: 'desc'
  });
  const { data: rockets, isLoading: rocketsLoading, error: rocketsError } = useGetRocketsQuery({ 
    limit: pagination.rocketsLimit 
  });
  const { data: capsules, isLoading: capsulesLoading, error: capsulesError } = useGetCapsulesQuery({ 
    limit: pagination.capsulesLimit 
  });
  const { data: ships, isLoading: shipsLoading, error: shipsError } = useGetShipsQuery({ 
    limit: pagination.shipsLimit 
  });

  const handleViewChange = (newView: SpaceXView) => {
    dispatch(setView(newView));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setSearchTerm(value));
  };

  const filteredLaunches = launches?.filter(launch => 
    launch.mission_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    launch.rocket?.rocket_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRockets = rockets?.filter(rocket => 
    rocket.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rocket.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCapsules = capsules?.filter(capsule => 
    capsule.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    capsule.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredShips = ships?.filter(ship => 
    ship.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ship.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalLaunches: launches?.length || 0,
    successfulLaunches: launches?.filter(l => l.launch_success).length || 0,
    activeCapsules: capsules?.filter(c => c.status === 'active').length || 0,
    activeShips: ships?.filter(s => s.active).length || 0
  };

  return (
    <Page>
      <PageHeader
        title="SpaceX Mission Control"
        description="Real-time data from SpaceX operations - launches, fleet status, and mission analytics"
      />

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Launches</p>
              <p className="text-3xl font-bold">{stats.totalLaunches}</p>
            </div>
            
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Successful</p>
              <p className="text-3xl font-bold">{stats.successfulLaunches}</p>
            </div>
            
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Capsules</p>
              <p className="text-3xl font-bold">{stats.activeCapsules}</p>
            </div>
            
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Fleet Ships</p>
              <p className="text-3xl font-bold">{stats.activeShips}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search missions, rockets, capsules, ships..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={pagination.launchesLimit} 
              onChange={(e) => dispatch(setLaunchesLimit(Number(e.target.value)))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 launches</option>
              <option value={20}>20 launches</option>
              <option value={50}>50 launches</option>
            </select>
            <select 
              value={pagination.rocketsLimit} 
              onChange={(e) => dispatch(setRocketsLimit(Number(e.target.value)))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 rockets</option>
              <option value={10}>10 rockets</option>
              <option value={20}>20 rockets</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={view === 'launches' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleViewChange('launches')}
        >
          Launches ({filteredLaunches?.length || 0})
        </Button>
        <Button
          variant={view === 'rockets' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleViewChange('rockets')}
        >
          Rockets ({filteredRockets?.length || 0})
        </Button>
        <Button
          variant={view === 'capsules' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleViewChange('capsules')}
        >
          Capsules ({filteredCapsules?.length || 0})
        </Button>
        <Button
          variant={view === 'ships' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleViewChange('ships')}
        >
          Ships ({filteredShips?.length || 0})
        </Button>
      </div>

      {/* Launches View */}
      {view === 'launches' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Mission Launches
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredLaunches?.length || 0} of {launches?.length || 0} launches
            </p>
          </div>
          <div className="p-6">
            {launchesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading mission data...</p>
              </div>
            ) : launchesError ? (
              <div className="text-center py-12 text-red-600">
                <p>Error loading launch data</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLaunches?.map((launch) => (
                  <div key={launch.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {launch.links?.mission_patch_small && (
                          <img
                            src={launch.links.mission_patch_small}
                            alt={launch.mission_name || ''}
                            className="h-12 w-12 rounded-full border-2 border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{launch.mission_name}</h3>
                          <p className="text-sm text-gray-500">
                            {launch.launch_date_utc ? new Date(launch.launch_date_utc).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          launch.launch_success
                            ? 'bg-green-100 text-green-800'
                            : launch.launch_success === false
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {launch.launch_success ? 'Success' : launch.launch_success === false ? 'Failed' : 'Pending'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium text-gray-700">Rocket:</span> {launch.rocket?.rocket_name || 'N/A'}</p>
                      <p><span className="font-medium text-gray-700">Site:</span> {launch.launch_site?.site_name_long || 'N/A'}</p>
                      {launch.details && (
                        <p className="text-gray-600 text-xs mt-3 line-clamp-3">{launch.details}</p>
                      )}
                    </div>
                    {launch.links?.video_link && (
                      <div className="mt-4">
                        <a 
                          href={launch.links.video_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Watch Launch →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rockets View */}
      {view === 'rockets' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Rocket Fleet
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredRockets?.length || 0} of {rockets?.length || 0} rockets
            </p>
          </div>
          <div className="p-6">
            {rocketsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading rocket data...</p>
              </div>
            ) : rocketsError ? (
              <div className="text-center py-12 text-red-600">
                <p>Error loading rocket data</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRockets?.map((rocket) => (
                  <div key={rocket.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:border-red-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{rocket.name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          rocket.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rocket.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium">{rocket.type}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Country</p>
                        <p className="font-medium">{rocket.country}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">First Flight</p>
                        <p className="font-medium">{rocket.first_flight}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Success Rate</p>
                        <p className="font-medium">{rocket.success_rate_pct}%</p>
                      </div>
                    </div>
                    {rocket.cost_per_launch && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600">Cost per Launch</p>
                        <p className="text-lg font-bold text-green-600">${(rocket.cost_per_launch / 1000000).toFixed(1)}M</p>
                      </div>
                    )}
                    {rocket.description && (
                      <p className="text-gray-600 text-sm line-clamp-3">{rocket.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Capsules View */}
      {view === 'capsules' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Dragon Capsules
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredCapsules?.length || 0} of {capsules?.length || 0} capsules
            </p>
          </div>
          <div className="p-6">
            {capsulesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading capsule data...</p>
              </div>
            ) : capsulesError ? (
              <div className="text-center py-12 text-red-600">
                <p>Error loading capsule data</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCapsules?.map((capsule) => (
                  <div key={capsule.id} className="relative bg-gradient-to-br from-purple-50 to-indigo-100 border-2 border-purple-200 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-purple-400 group">

                    
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="text-sm font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex-1">
                          {capsule.id}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-full shadow-sm flex-shrink-0 ${
                            capsule.status === 'active'
                              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white'
                              : capsule.status === 'retired'
                              ? 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                          }`}
                        >
                          {capsule.status === 'active' ? 'ACTIVE' : capsule.status === 'retired' ? 'RETIRED' : 'UNKNOWN'}
                        </span>
                      </div>
                      <div className="h-1 bg-gradient-to-r from-purple-300 to-indigo-300 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Type</p>
                        <p className="text-sm font-bold text-gray-800">{capsule.type}</p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Landings</p>
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                          {capsule.landings || 0}
                        </p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Reuses</p>
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                          {capsule.reuse_count || 0}
                        </p>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Missions</p>
                        <p className="text-sm font-bold text-gray-800">
                          {(capsule.landings || 0) + (capsule.reuse_count || 0)}
                        </p>
                      </div>
                    </div>

                    {capsule.original_launch && (
                      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-3 border border-purple-200 mb-4">
                        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">First Launch</p>
                        <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                          {new Date(capsule.original_launch).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-center">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        (capsule.reuse_count || 0) > 5 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                          : (capsule.reuse_count || 0) > 2
                          ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
                          : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                      }`}>
                        {(capsule.reuse_count || 0) > 5 ? 'VETERAN' : (capsule.reuse_count || 0) > 2 ? 'EXPERIENCED' : 'ROOKIE'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ships View */}
      {view === 'ships' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              Support Fleet
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredShips?.length || 0} of {ships?.length || 0} ships
            </p>
          </div>
          <div className="p-6">
            {shipsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading fleet data...</p>
              </div>
            ) : shipsError ? (
              <div className="text-center py-12 text-red-600">
                <p>Error loading ship data</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShips?.map((ship) => (
                  <div key={ship.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-cyan-300">
                    {ship.image && (
                      <img
                        src={ship.image}
                        alt={ship.name || ''}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{ship.name}</h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            ship.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ship.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-700">Type:</span> {ship.type}</p>
                        {ship.home_port && (
                          <p><span className="font-medium text-gray-700">Home Port:</span> {ship.home_port}</p>
                        )}
                        {ship.year_built && (
                          <p><span className="font-medium text-gray-700">Built:</span> {ship.year_built}</p>
                        )}
                      </div>
                    </div>
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