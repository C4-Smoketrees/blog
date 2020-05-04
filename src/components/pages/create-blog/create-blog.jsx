import React from 'react'
import Navbar from '../../navbar/navbar'
import SideDrawer from '../../side-drawer/side-drawer'
import Backdrop from '../../backdrop/backdrop'
import Blog from '../../blog/blog'
import TextareaAutosize from 'react-autosize-textarea'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Snackbar from '@material-ui/core/Snackbar'

class CreateBlog extends React.Component {
  constructor (props) {
    super(props)

    this.title = props.blog.title
    this.content = props.blog.content
    this.tags = props.blog.tags
    this.coverImage = props.blog.coverImage
    this.draftId = props.blog.draftId
    this.user = props.user

    if (!this.title) {
      this.title = ''
    }
    if (!this.content) {
      this.content = ''
    }
    if (!this.tags) {
      this.tags = []
    }
    if (!this.coverImage) {
      this.coverImage = ''
    }

    // States
    this.state = {
      navbarOpen: false,
      sideDrawerOpen: false,
      display: 'none',
      coverImage: this.coverImage,
      title: this.title,
      tags: this.tags,
      content: this.content,
      draftId: this.draftId,
      currentContent: 0,
      saveDisabled: false,
      publishDisabled: false,
      snackbarOpen: false
    }

    // Event Handlers
    this.handleToggleClick = () => {
      this.setState((pevState) => {
        return { sideDrawerOpen: !pevState.sideDrawerOpen } // passing reference
      })
    }

    this.onBackdropClick = () => {
      this.setState({ sideDrawerOpen: false })
    }

    this.handleEnterKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
      }
    }

    this.handleSpaceAndEnterKeyPress = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
      }
      if (e.key === 'Backspace') {
        const tagLength = this.state.tags.length
        if (tagLength) {
          if (this.state.tags[tagLength - 1].length === 2) {
            e.preventDefault()
            const tags = this.state.tags
            tags.pop()
            this.setState({ tags: tags })
          }
        }
      }
    }

    this.handleTitleChange = (e) => {
      this.setState({ title: e.target.value })
      if (e.target.value.length > 120) {
        e.target.style.background = 'rgba(19,19,19,0.5)'
      } else {
        e.target.style.background = 'white'
      }
    }

    this.handleTagChange = (e) => {
      const tags = e.target.value.split(',')
      tags.forEach((ele, i) => {
        if (ele[1] !== '#') {
          ele = i === 0 ? '‎#' + ele : ' #' + ele
        }
        tags[i] = ele
      })
      this.setState({ tags: tags })
    }

    this.createTagString = () => {
      return this.state.tags
    }

    this.handleCoverChange = (e) => {
      this.setState({ coverImage: e.target.value })
    }

    this.handleContentChange = (e) => {
      this.setState({ content: e.target.value })
    }

    this.handlePreviewClick = (e) => {
      this.setState({ currentContent: 1 })
      e.target.style.display = 'none'
      const edit = e.target.parentNode.querySelector('.single-blog-button-edit')
      edit.style.display = 'block'
    }

    this.handleEditClick = (e) => {
      this.setState({ currentContent: 0 })
      e.target.style.display = 'none'
      const preview = e.target.parentNode.querySelector('.single-blog-button-preview')
      preview.style.display = 'block'
    }

    this.handleSnackbarClose = (e, r) => {
      if (r === 'clickaway') {
        return
      }
      this.setState({ snackbarOpen: false })
    }

    this.handleSaveClick = (e) => {
      this.setState({ saveDisabled: true })
      window.fetch(window.location.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: {
            draftId: this.state.draftId,
            content: this.state.content,
            title: this.state.title,
            tags: this.state.tags,
            coverImage: this.state.coverImage
          },
          action: 'save'
        })
      })
        .then(res => res.json())
        .then(body => {
          this.setState({ draftId: body.draftId, saveDisabled: false, snackbarOpen: true })
        })
        .catch(() => {
          window.location = `${window.location.origin}/error`
        })
    }
    this.handlePublishClick = (e) => {
      this.setState({ publishDisabled: true })
      window.fetch(window.location.href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: {
            draftId: this.state.draftId,
            content: this.state.content,
            title: this.state.title,
            tags: this.state.tags,
            coverImage: this.state.coverImage
          },
          action: 'publish'
        })
      })
        .then(res => res.json())
        .then(body => {
          if (body.status) {
            window.location = `${window.location.origin}/blogs/id/${body.blogId}`
          }
        })
        .catch(() => {
          window.location = `${window.location.origin}/error`
        })
      this.setState({ publishDisabled: false })
    }
  }

  render () {
    let backdrop

    if (this.state.sideDrawerOpen) {
      backdrop = <Backdrop handleOnClick={this.onBackdropClick} />
    }

    // Preview defined
    const preview =
      <div className='single-blog-container'>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={this.state.snackbarOpen}
          autoHideDuration={4000}
          onClose={this.handleSnackbarClose}
          message='Your changes have been saved.'
          action={
            <>
              <IconButton size='small' aria-label='close' color='inherit' onClick={this.handleSnackbarClose}>
                <CloseIcon fontSize='small' />
              </IconButton>
            </>
          }
        />
        <div className='blog-container'>
          <div className='preview-container'>
            <Blog
              content={this.state.content}
              title={this.state.title}
              coverImage={this.state.coverImage}
              tags={this.state.tags}
              author={`${this.user.firstName} ${this.user.lastName}`}
              date={Date.now()}
              profilePic={this.user.profilePicture}
            />
          </div>
        </div>
      </div>

    // edit defined
    const edit =
      <div className='single-blog-container'>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
          open={this.state.snackbarOpen}
          autoHideDuration={4000}
          onClose={this.handleSnackbarClose}
          message='Your changes have been saved.'
          action={
            <>
              <IconButton size='small' aria-label='close' color='inherit' onClick={this.handleSnackbarClose}>
                <CloseIcon fontSize='small' />
              </IconButton>
            </>
          }
        />
        <div className='blog-container'>
          <div className='single-blog-input single-blog-input-title'>
            <TextareaAutosize
              onKeyDown={this.handleEnterKeyPress}
              onChange={this.handleTitleChange}
              placeholder='Title (in 50 characters)'
              value={this.state.title}
            />
          </div>
          <div
            className='single-blog-input single-blog-input-cover-image'
          >
            <TextareaAutosize
              placeholder='Link for cover image'
              onKeyDown={this.handleEnterKeyPress}
              onChange={this.handleCoverChange}
              value={this.state.coverImage}
            />
          </div>
          <div
            className='single-blog-input single-blog-input-tags'
          >
            <TextareaAutosize
              placeholder='Tags (separated by a comma `,`)'
              onKeyDown={this.handleSpaceAndEnterKeyPress}
              onChange={this.handleTagChange}
              value={this.createTagString()}
            />
          </div>
          <div
            className='single-blog-input single-blog-input-content'
          >
            <TextareaAutosize
              placeholder='Type the content of the blog here....'
              onChange={this.handleContentChange}
              value={this.state.content}
            />
          </div>
        </div>
      </div>

    // Current content condition
    let currentContent
    if (this.state.currentContent === 0) {
      currentContent = edit
    } else {
      currentContent = preview
    }

    // Rendered
    const ret =
      <div className='center' style={{ height: '100%' }}>
        <Navbar onToggleClick={this.handleToggleClick} user={this.user} />
        <SideDrawer show={this.state.sideDrawerOpen} />
        {backdrop}
        <div className='rendered-values-blog'>
          <div className='single-blog-button-group'>
            <button
              className='single-blog-button single-blog-button-preview'
              onClick={this.handlePreviewClick}
            >
              Preview
            </button>
            <button
              className='single-blog-button single-blog-button-edit'
              style={{ display: 'none' }}
              onClick={this.handleEditClick}
            >
              Edit
            </button>
            <button
              className='single-blog-button'
              onClick={this.handleSaveClick}
              disabled={this.state.saveDisabled}
            >
              Save
            </button>
            <button
              className='single-blog-button'
              onClick={this.handlePublishClick}
              disabled={this.state.publishDisabled}
            >
              Publish
            </button>
          </div>
          <div className='single-blog-card'>
            {currentContent}
          </div>
        </div>
      </div>

    // Return
    return (
      <div className='react-root'>
        {
          ret
        }
      </div>
    )
  }
}

export default CreateBlog
