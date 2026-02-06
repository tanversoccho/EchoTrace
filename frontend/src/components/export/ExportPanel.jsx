import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextField,
  Chip,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Download,
  Email,
  Share,
  Schedule,
  FilterList
} from '@mui/icons-material'
import { useTOR } from '../../context/TORContext'
import { format } from 'date-fns'

const ExportPanel = () => {
  const {  filteredTors, filters } = useTOR()
  const [exportType, setExportType] = useState('csv')
  const [includeColumns, setIncludeColumns] = useState([
    'title', 'description', 'source', 'organization', 'publish_date', 'deadline', 'link'
  ])
  const [emailExport, setEmailExport] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [scheduledExport, setScheduledExport] = useState(false)
  const [scheduleFrequency, setScheduleFrequency] = useState('daily')
  const [exportName, setExportName] = useState('')
  const [exporting, setExporting] = useState(false)

  const columnOptions = [
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'source', label: 'Source' },
    { value: 'organization', label: 'Organization' },
    { value: 'publish_date', label: 'Publish Date' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'link', label: 'Link' },
    { value: 'reference', label: 'Reference No' },
    { value: 'country', label: 'Country' },
    { value: 'category', label: 'Category' },
    { value: 'budget_range', label: 'Budget Range' },
    { value: 'scraped_at', label: 'Scraped At' }
  ]

  const handleExport = async () => {
    setExporting(true)
    try {
      const exportData = {
        type: exportType,
        columns: includeColumns,
        filters: filters,
        tors: filteredTors.map(tor => ({
          id: tor.id,
          ...tor
        })),
        options: {
          email: emailExport ? emailRecipients.split(',').map(e => e.trim()) : null,
          schedule: scheduledExport ? scheduleFrequency : null,
          name: exportName || `ToRs_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`
        }
      }

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      })

      if (response.ok) {
        if (exportType === 'csv') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${exportData.options.name}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else if (exportType === 'excel') {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${exportData.options.name}.xlsx`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }

        alert('Export completed successfully!')
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleColumnToggle = (column) => {
    if (includeColumns.includes(column)) {
      setIncludeColumns(includeColumns.filter(c => c !== column))
    } else {
      setIncludeColumns([...includeColumns, column])
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Export ToRs
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Chip 
          label={`${filteredTors.length} ToRs selected`}
          color="primary"
          icon={<FilterList />}
        />
        <Chip 
          label={exportType.toUpperCase()}
          variant="outlined"
        />
      </Box>

      <Stack spacing={3}>
        {/* Export Name */}
        <TextField
          label="Export Name"
          value={exportName}
          onChange={(e) => setExportName(e.target.value)}
          placeholder="Enter export name"
          fullWidth
        />

        {/* Export Type */}
        <FormControl fullWidth>
          <InputLabel>Export Format</InputLabel>
          <Select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            label="Export Format"
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="excel">Excel (XLSX)</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="pdf">PDF Report</MenuItem>
          </Select>
        </FormControl>

        {/* Column Selection */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Select Columns to Include
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {columnOptions.map((column) => (
              <Chip
                key={column.value}
                label={column.label}
                color={includeColumns.includes(column.value) ? 'primary' : 'default'}
                variant={includeColumns.includes(column.value) ? 'filled' : 'outlined'}
                onClick={() => handleColumnToggle(column.value)}
                clickable
              />
            ))}
          </Stack>
        </Box>

        {/* Email Export */}
        <FormControlLabel
          control={
            <Checkbox
              checked={emailExport}
              onChange={(e) => setEmailExport(e.target.checked)}
            />
          }
          label="Email Export"
        />
        
        {emailExport && (
          <TextField
            label="Recipient Emails"
            value={emailRecipients}
            onChange={(e) => setEmailRecipients(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            fullWidth
            helperText="Separate multiple emails with commas"
          />
        )}

        {/* Scheduled Export */}
        <FormControlLabel
          control={
            <Checkbox
              checked={scheduledExport}
              onChange={(e) => setScheduledExport(e.target.checked)}
            />
          }
          label="Schedule Regular Export"
        />
        
        {scheduledExport && (
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              value={scheduleFrequency}
              onChange={(e) => setScheduleFrequency(e.target.value)}
              label="Frequency"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly (Monday)</MenuItem>
              <MenuItem value="monthly">Monthly (1st)</MenuItem>
            </Select>
          </FormControl>
        )}

        {/* Preview */}
        <Alert severity="info">
          <Typography variant="body2">
            This export will include {filteredTors.length} ToRs matching your current filters.
            {filters.source.length > 0 && ` Sources: ${filters.source.join(', ')}`}
            {filters.keywords && ` Keywords: "${filters.keywords}"`}
          </Typography>
        </Alert>

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Share />}
          >
            Share Export
          </Button>
          
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
            onClick={handleExport}
            disabled={exporting || filteredTors.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export Now'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}

export default ExportPanel
