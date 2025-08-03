'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'

// FilterControls component - provides toggles for Show Total and Carry Over options
// This component is used across multiple tabs (Records, Analysis, Budget) for consistent filter controls
export default function FilterControls() {
  const { state, dispatch } = useApp()

  // Handle Show Total toggle change
  // When enabled, shows the balance in calculations and displays
  const handleShowTotalChange = (checked: boolean) => {
    dispatch({
      type: 'SET_FILTER_STATE',
      payload: { showTotal: checked }
    })
  }

  // Handle Carry Over toggle change
  // When enabled, surplus/shortage from previous periods is carried over
  const handleCarryOverChange = (checked: boolean) => {
    dispatch({
      type: 'SET_FILTER_STATE',
      payload: { carryOver: checked }
    })
  }

  return (
    <div className="flex items-center space-x-6">
      {/* Show Total toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="show-total"
          checked={state.filterState.showTotal}
          onCheckedChange={handleShowTotalChange}
        />
        <Label htmlFor="show-total" className="text-sm font-medium">
          Show Total
        </Label>
      </div>

      {/* Carry Over toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="carry-over"
          checked={state.filterState.carryOver}
          onCheckedChange={handleCarryOverChange}
        />
        <Label htmlFor="carry-over" className="text-sm font-medium">
          Carry Over
        </Label>
      </div>
    </div>
  )
} 