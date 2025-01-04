const vps = await this.vpsService.getVps(vpsId);
if (!vps) {
  throw new NotFoundException('VPS not found');
}

const feedback = new VpsFeedback();
feedback.vps = vps;
feedback.rating = createVpsFeedbackDto.rating;
feedback.comment = createVpsFeedbackDto.comment;

await this.vpsFeedbackRepository.save(feedback);

return {
  id: feedback.id,
  rating: feedback.rating,
  comment: feedback.comment,
  createdAt: feedback.createdAt,
  vpsId: vps.id
};