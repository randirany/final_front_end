import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getAccidentByTicketNumber,
  getAccidentComments,
  updateAccidentStatus,
  addAccidentComment
} from '../services/accidentApi';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  AlertTriangle,
  User,
  Car,
  Clock,
  MessageSquare,
  Send,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { formatDateISO } from '../utils/dateFormatter';

const AccidentDetail = () => {
  const { ticketNumber } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [accident, setAccident] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [commentImages, setCommentImages] = useState([]);
  const [commentPreviews, setCommentPreviews] = useState([]);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');

  useEffect(() => {
    loadTicketData();
  }, [ticketNumber]);

  const loadTicketData = async () => {
    setLoading(true);
    try {
      const ticketResponse = await getAccidentByTicketNumber(ticketNumber);
      setAccident(ticketResponse.accident);

      const commentsResponse = await getAccidentComments(
        ticketResponse.accident._id,
        true
      );
      setComments(commentsResponse.comments || []);
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast.error(t('accidents.loadError', 'Failed to load ticket details'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error(t('accidents.commentRequired', 'Comment is required'));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('comment', newComment);
      formData.append('isInternal', isInternal);

      commentImages.forEach(image => {
        formData.append('image', image);
      });

      await addAccidentComment(accident._id, formData);

      toast.success(t('accidents.commentAdded', 'Comment added successfully'));
      setNewComment('');
      setIsInternal(false);
      setCommentImages([]);
      setCommentPreviews([]);
      loadTicketData();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error(t('accidents.commentError', 'Failed to add comment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();

    if (!newStatus) {
      toast.error(t('accidents.selectStatus', 'Please select a status'));
      return;
    }

    setSubmitting(true);
    try {
      await updateAccidentStatus(accident._id, {
        status: newStatus,
        comment: statusComment
      });

      toast.success(t('accidents.statusUpdated', 'Status updated successfully'));
      setShowStatusModal(false);
      setNewStatus('');
      setStatusComment('');
      loadTicketData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t('accidents.statusError', 'Failed to update status'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + commentImages.length > 5) {
      toast.error(t('accidents.maxCommentImages', 'Maximum 5 images allowed'));
      return;
    }

    setCommentImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCommentPreviews(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveCommentImage = (index) => {
    setCommentImages(prev => prev.filter((_, i) => i !== index));
    setCommentPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-500',
      in_progress: 'bg-orange-500',
      pending_review: 'bg-purple-500',
      resolved: 'bg-green-500',
      closed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: AlertCircle,
      in_progress: Clock,
      pending_review: AlertCircle,
      resolved: CheckCircle,
      closed: XCircle
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="w-5 h-5" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-orange-600 bg-orange-100',
      high: 'text-red-600 bg-red-100',
      urgent: 'text-red-800 bg-red-200'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!accident) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600">
            {t('accidents.notFound', 'Ticket not found')}
          </h2>
          <button
            onClick={() => navigate('/accidents')}
            className="mt-4 text-blue-600 hover:underline"
          >
            {t('accidents.backToList', 'Back to list')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/accidents')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back', 'Back')}
        </button>
      </div>

      {/* Ticket Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
              {getStatusIcon(accident.status)}
              {accident.ticketNumber}
            </h1>
            <p className="text-gray-600">
              {t('accidents.created', 'Created')}: {formatDateISO(accident.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`px-4 py-2 rounded-lg text-white font-semibold ${getStatusColor(accident.status)}`}>
              {t(`accidents.status${accident.status.charAt(0).toUpperCase() + accident.status.slice(1)}`, accident.status.replace('_', ' ').toUpperCase())}
            </span>
            <span className={`px-4 py-2 rounded-lg font-semibold ${getPriorityColor(accident.priority)}`}>
              {t(`accidents.priority${accident.priority.charAt(0).toUpperCase() + accident.priority.slice(1)}`, accident.priority.toUpperCase())}
            </span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">{accident.title}</h2>
        <p className="text-gray-700 mb-4">{accident.description}</p>

        {/* Images */}
        {accident.images && accident.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {accident.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Accident ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(img, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">
                {t('accidents.insuredPerson', 'Insured Person')}
              </h3>
            </div>
            <p className="text-gray-700">
              {accident.insured?.first_name} {accident.insured?.last_name}
            </p>
            <p className="text-gray-600 text-sm">
              {t('accidents.id', 'ID')}: {accident.insured?.id_Number}
            </p>
            <p className="text-gray-600 text-sm">
              {t('accidents.phone', 'Phone')}: {accident.insured?.phone_number}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-800">
                {t('accidents.assignedTo', 'Assigned To')}
              </h3>
            </div>
            <p className="text-gray-700">
              {accident.assignedTo?.name || t('accidents.unassigned', 'Unassigned')}
            </p>
            {accident.assignedTo?.email && (
              <p className="text-gray-600 text-sm">{accident.assignedTo.email}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              setNewStatus(accident.status);
              setShowStatusModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {t('accidents.updateStatus', 'Update Status')}
          </button>
        </div>
      </div>

      {/* Status History */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          {t('accidents.statusTimeline', 'Status Timeline')}
        </h3>
        <div className="space-y-4">
          {accident.statusHistory?.map((entry, index) => (
            <div key={index} className="flex gap-4 border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(entry.status)}`}>
                    {entry.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {t('accidents.by', 'by')} {entry.changedBy?.name} - {formatDateISO(entry.changedAt)}
                </p>
                {entry.comment && (
                  <p className="text-gray-700 italic mt-1">"{entry.comment}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          {t('accidents.comments', 'Comments')} ({comments.length})
        </h3>

        {/* Comment List */}
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className={`border-l-4 ${comment.isInternal ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'} p-4 rounded-r-lg`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-gray-800">
                    {comment.user?.name}
                  </span>
                  {comment.isInternal && (
                    <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      {t('accidents.internal', 'INTERNAL')}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {formatDateISO(comment.createdAt)}
                </span>
              </div>
              <p className="text-gray-700">{comment.comment}</p>
              {comment.images && comment.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {comment.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt=""
                      className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(img, '_blank')}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="border-t pt-6">
          <h4 className="font-semibold text-gray-800 mb-3">
            {t('accidents.addComment', 'Add Comment')}
          </h4>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('accidents.commentPlaceholder', 'Add a comment...')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            rows="4"
            required
          />

          {/* Image Upload */}
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCommentImageSelect}
              className="hidden"
              id="commentImageUpload"
            />
            <label
              htmlFor="commentImageUpload"
              className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Upload className="w-5 h-5" />
              {t('accidents.uploadImages', 'Upload Images')}
            </label>
          </div>

          {/* Image Previews */}
          {commentPreviews.length > 0 && (
            <div className="flex gap-2 mb-3">
              {commentPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCommentImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              {t('accidents.internalNote', 'Internal Note (staff only)')}
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
              {t('accidents.addComment', 'Add Comment')}
            </button>
          </div>
        </form>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {t('accidents.updateStatus', 'Update Status')}
            </h3>
            <form onSubmit={handleStatusUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('accidents.newStatus', 'New Status')}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="open">{t('accidents.statusOpen', 'Open')}</option>
                  <option value="in_progress">{t('accidents.statusInProgress', 'In Progress')}</option>
                  <option value="pending_review">{t('accidents.statusPendingReview', 'Pending Review')}</option>
                  <option value="resolved">{t('accidents.statusResolved', 'Resolved')}</option>
                  <option value="closed">{t('accidents.statusClosed', 'Closed')}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('accidents.statusChangeComment', 'Comment (optional)')}
                </label>
                <textarea
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder={t('accidents.statusCommentPlaceholder', 'Add a comment about this status change...')}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
                >
                  {submitting ? t('common.updating', 'Updating...') : t('common.update', 'Update')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusComment('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccidentDetail;
