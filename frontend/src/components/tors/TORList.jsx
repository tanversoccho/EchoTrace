import React, { useState, useMemo } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Avatar
} from '@mui/material'
import {
  Visibility,
  Star,
  StarBorder,
  Download,
  Share,
  Delete
} from '@mui/icons-material'
import { useTOR } from '../../context/TORContext'
import { formatDate, truncateText } from '../../utils/formatters'

const TORList = () => {
  const { filteredTors, markAsRead, markAsFavorite } = useTOR()
  const [selected, setSelected] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = filteredTors.map((tor) => tor.id)
      setSelected(newSelected)
      return
    }
    setSelected([])
  }

  const handleSelect = (id) => {
    const selectedIndex = selected.indexOf(id)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      )
    }

    setSelected(newSelected)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const visibleTors = useMemo(() => {
    return filteredTors.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    )
  }, [filteredTors, page, rowsPerPage])

  const getSourceColor = (source) => {
    const colors = {
      'World Bank': 'success',
      'UNDP': 'primary',
      'ADB': 'warning',
      'UNHCR': 'error',
      'BDJobs': 'info'
    }
    return colors[source] || 'default'
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < filteredTors.length
                  }
                  checked={
                    filteredTors.length > 0 && selected.length === filteredTors.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleTors.map((tor) => {
              const isSelected = selected.includes(tor.id)
              return (
                <TableRow
                  key={tor.id}
                  hover
                  selected={isSelected}
                  sx={{
                    opacity: tor.is_read ? 0.7 : 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelect(tor.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {truncateText(tor.title, 60)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {truncateText(tor.description, 80)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tor.source}
                      size="small"
                      color={getSourceColor(tor.source)}
                      avatar={
                        <Avatar sx={{ bgcolor: 'transparent' }}>
                          {tor.source.charAt(0)}
                        </Avatar>
                      }
                    />
                  </TableCell>
                  <TableCell>{tor.organization}</TableCell>
                  <TableCell>
                    <Tooltip title={formatDate(tor.publish_date, 'full')}>
                      <span>{formatDate(tor.publish_date)}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {tor.deadline ? (
                      <Chip
                        label={formatDate(tor.deadline)}
                        size="small"
                        color={
                          // eslint-disable-next-line react-hooks/purity
                          new Date(tor.deadline) < new Date(Date.now() + 7 * 86400000)
                            ? 'error'
                            : 'default'
                        }
                        variant="outlined"
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => markAsRead(tor.id)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={tor.is_favorite ? "Remove favorite" : "Add favorite"}>
                        <IconButton
                          size="small"
                          onClick={() => markAsFavorite(tor.id)}
                          color={tor.is_favorite ? 'warning' : 'default'}
                        >
                          {tor.is_favorite ? <Star /> : <StarBorder />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Download">
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Share">
                        <IconButton size="small">
                          <Share />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredTors.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

export default TORList
